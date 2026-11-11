from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import get_db, init_db, loads
from app.seed import seed_cities
from app.providers import open_meteo
from app.sync import enrich_city, sync_all_cities
from app.weather_codes import label

TEHRAN = ZoneInfo("Asia/Tehran")
scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    seed_cities()
    try:
        await sync_all_cities()
    except Exception as exc:  # noqa: BLE001 — startup must not die on network blip
        print(f"initial sync failed: {exc}")
    scheduler.add_job(
        sync_all_cities,
        "interval",
        minutes=settings.sync_interval_minutes,
        id="weather-sync",
        replace_existing=True,
    )
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title="WeatherAgent API", version="1.0.0", lifespan=lifespan)
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _day_cell(row: dict | None) -> dict | None:
    if not row:
        return None
    code = row.get("weather_code")
    return {
        "date": row.get("date"),
        "weather_code": code,
        "label_en": label(code),
        "temp_max_c": row.get("temp_max_c"),
        "temp_min_c": row.get("temp_min_c"),
        "precip_mm": row.get("precip_mm"),
    }


@app.get("/api/health")
def health():
    with get_db() as conn:
        last = conn.execute(
            "SELECT value FROM sync_meta WHERE key = 'last_sync'"
        ).fetchone()
        count = conn.execute("SELECT COUNT(*) AS n FROM cities").fetchone()["n"]
    return {
        "ok": True,
        "cities": count,
        "last_sync": last["value"] if last else None,
    }


@app.get("/api/cities")
def list_cities():
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT c.*, w.temp_c, w.feels_like_c, w.weather_code, w.humidity,
                   w.wind_kmh, w.wind_dir, w.updated_at AS weather_updated_at
            FROM cities c
            LEFT JOIN current_weather w ON w.city_id = c.id
            WHERE c.important = 1
            ORDER BY c.name_en
            """
        ).fetchall()
    out = []
    for r in rows:
        d = dict(r)
        code = d.get("weather_code")
        d["label_en"] = label(code)
        out.append(d)
    return {"cities": out}


@app.get("/api/forecast")
def forecast_grid():
    today = datetime.now(TEHRAN).date()
    dates = [today + timedelta(days=i) for i in range(6)]  # today..+5
    date_strs = [d.isoformat() for d in dates]
    weekday_abbr = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

    with get_db() as conn:
        cities = [
            dict(r)
            for r in conn.execute(
                "SELECT id, slug, name_en FROM cities WHERE important = 1 ORDER BY name_en"
            )
        ]
        forecasts = conn.execute(
            f"""
            SELECT city_id, date, weather_code, temp_max_c, temp_min_c, precip_mm
            FROM daily_forecast
            WHERE date IN ({",".join("?" * len(date_strs))})
            """,
            date_strs,
        ).fetchall()

    by_city: dict[int, dict[str, dict]] = {}
    for f in forecasts:
        by_city.setdefault(f["city_id"], {})[f["date"]] = dict(f)

    columns = [
        {"key": "today", "label": "Today", "date": date_strs[0]},
        {"key": "tomorrow", "label": "Tomorrow", "date": date_strs[1]},
    ]
    for d in dates[2:]:
        columns.append(
            {
                "key": d.isoformat(),
                "label": weekday_abbr[d.weekday()],
                "date": d.isoformat(),
            }
        )

    rows = []
    for city in cities:
        cells = {}
        city_fc = by_city.get(city["id"], {})
        for col in columns:
            cells[col["key"]] = _day_cell(city_fc.get(col["date"]))
        rows.append(
            {
                "slug": city["slug"],
                "name_en": city["name_en"],
                "days": cells,
            }
        )

    return {"columns": columns, "rows": rows}


@app.get("/api/cities/{slug}")
async def city_detail(slug: str):
    with get_db() as conn:
        city = conn.execute(
            "SELECT * FROM cities WHERE slug = ?", (slug,)
        ).fetchone()
        if not city:
            raise HTTPException(404, "City not found")
        city_d = dict(city)
        current = conn.execute(
            "SELECT * FROM current_weather WHERE city_id = ?", (city_d["id"],)
        ).fetchone()
        daily = [
            dict(r)
            for r in conn.execute(
                """
                SELECT * FROM daily_forecast
                WHERE city_id = ?
                ORDER BY date
                LIMIT 7
                """,
                (city_d["id"],),
            )
        ]

    extras = await enrich_city(city_d)
    try:
        hourly_raw = await open_meteo.fetch_hourly(city_d["lat"], city_d["lon"], 24)
    except Exception as exc:  # noqa: BLE001 — city page still useful without hourly
        print(f"hourly fetch failed for {slug}: {exc}")
        hourly_raw = []
    code = current["weather_code"] if current else None
    return {
        "city": {
            "id": city_d["id"],
            "slug": city_d["slug"],
            "name_en": city_d["name_en"],
            "lat": city_d["lat"],
            "lon": city_d["lon"],
        },
        "current": {
            **(dict(current) if current else {}),
            "label_en": label(code),
        }
        if current
        else None,
        "hourly": [
            {
                **h,
                "label_en": label(h.get("weather_code")),
            }
            for h in hourly_raw
        ],
        "daily": [
            {
                **d,
                "label_en": label(d.get("weather_code")),
            }
            for d in daily
        ],
        "extras": {
            **{k: v for k, v in extras.items() if k != "providers_json"},
            "providers": loads(extras.get("providers_json")),
        },
    }


@app.post("/api/sync")
async def trigger_sync():
    return await sync_all_cities()