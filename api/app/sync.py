from __future__ import annotations

from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from app.db import dumps, get_db, loads
from app.providers import open_meteo, openweather, tomorrow, visualcrossing

TEHRAN = ZoneInfo("Asia/Tehran")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def sync_all_cities() -> dict:
    with get_db() as conn:
        cities = [dict(r) for r in conn.execute("SELECT * FROM cities WHERE important = 1 ORDER BY name_en")]

    if not cities:
        return {"ok": False, "error": "no cities"}

    batch = await open_meteo.fetch_forecast_batch(cities)
    results = batch.get("results") or []
    updated = 0

    with get_db() as conn:
        for city, item in zip(cities, results):
            current = item.get("current") or {}
            daily = item.get("daily") or {}
            conn.execute(
                """
                INSERT INTO current_weather (
                  city_id, temp_c, feels_like_c, weather_code, humidity,
                  wind_kmh, wind_dir, updated_at, provider
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open-meteo')
                ON CONFLICT(city_id) DO UPDATE SET
                  temp_c=excluded.temp_c,
                  feels_like_c=excluded.feels_like_c,
                  weather_code=excluded.weather_code,
                  humidity=excluded.humidity,
                  wind_kmh=excluded.wind_kmh,
                  wind_dir=excluded.wind_dir,
                  updated_at=excluded.updated_at,
                  provider=excluded.provider
                """,
                (
                    city["id"],
                    current.get("temperature_2m"),
                    current.get("apparent_temperature"),
                    current.get("weather_code"),
                    current.get("relative_humidity_2m"),
                    current.get("wind_speed_10m"),
                    current.get("wind_direction_10m"),
                    _now_iso(),
                ),
            )

            dates = daily.get("time") or []
            for i, date in enumerate(dates):
                conn.execute(
                    """
                    INSERT INTO daily_forecast (
                      city_id, date, weather_code, temp_max_c, temp_min_c, precip_mm
                    ) VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(city_id, date) DO UPDATE SET
                      weather_code=excluded.weather_code,
                      temp_max_c=excluded.temp_max_c,
                      temp_min_c=excluded.temp_min_c,
                      precip_mm=excluded.precip_mm
                    """,
                    (
                        city["id"],
                        date,
                        (daily.get("weather_code") or [None])[i] if i < len(daily.get("weather_code") or []) else None,
                        (daily.get("temperature_2m_max") or [None])[i] if i < len(daily.get("temperature_2m_max") or []) else None,
                        (daily.get("temperature_2m_min") or [None])[i] if i < len(daily.get("temperature_2m_min") or []) else None,
                        (daily.get("precipitation_sum") or [None])[i] if i < len(daily.get("precipitation_sum") or []) else None,
                    ),
                )

            sunrises = daily.get("sunrise") or []
            sunsets = daily.get("sunset") or []
            uvs = daily.get("uv_index_max") or []
            conn.execute(
                """
                INSERT INTO city_extras (
                  city_id, sunrise, sunset, uv_index, providers_json, updated_at
                ) VALUES (?, ?, ?, ?, COALESCE((SELECT providers_json FROM city_extras WHERE city_id=?), '{}'), ?)
                ON CONFLICT(city_id) DO UPDATE SET
                  sunrise=excluded.sunrise,
                  sunset=excluded.sunset,
                  uv_index=COALESCE(excluded.uv_index, city_extras.uv_index),
                  updated_at=excluded.updated_at
                """,
                (
                    city["id"],
                    sunrises[0] if sunrises else None,
                    sunsets[0] if sunsets else None,
                    uvs[0] if uvs else None,
                    city["id"],
                    _now_iso(),
                ),
            )
            updated += 1

        conn.execute(
            """
            INSERT INTO sync_meta (key, value) VALUES ('last_sync', ?)
            ON CONFLICT(key) DO UPDATE SET value=excluded.value
            """,
            (_now_iso(),),
        )

    return {"ok": True, "updated": updated, "at": _now_iso()}


async def enrich_city(city: dict, force: bool = False) -> dict:
    """Pull AQI + commercial providers; cache in city_extras."""
    with get_db() as conn:
        extras = conn.execute(
            "SELECT * FROM city_extras WHERE city_id = ?", (city["id"],)
        ).fetchone()
        extras_d = dict(extras) if extras else {}
        providers = loads(extras_d.get("providers_json")) or {}

        if not force and extras_d.get("updated_at"):
            try:
                updated = datetime.fromisoformat(extras_d["updated_at"])
                if updated.tzinfo is None:
                    updated = updated.replace(tzinfo=timezone.utc)
                from app.config import settings

                if datetime.now(timezone.utc) - updated < timedelta(minutes=settings.extras_ttl_minutes):
                    if providers.get("openweathermap") or providers.get("tomorrow") or providers.get("visualcrossing"):
                        return extras_d
            except ValueError:
                pass

    aq = await open_meteo.fetch_air_quality(city["lat"], city["lon"])
    aqi = None
    pm25 = None
    if aq and aq.get("current"):
        aqi = aq["current"].get("european_aqi")
        pm25 = aq["current"].get("pm2_5")

    end = datetime.now(TEHRAN).date()
    start = end - timedelta(days=6)
    archive = await open_meteo.fetch_archive_sample(
        city["lat"], city["lon"], start.isoformat(), end.isoformat()
    )

    owm = await openweather.fetch_current(city["lat"], city["lon"])
    tm = await tomorrow.fetch_realtime(city["lat"], city["lon"])
    vc = await visualcrossing.fetch_timeline(city["lat"], city["lon"])

    providers = {
        "openweathermap": owm,
        "tomorrow": tm,
        "visualcrossing": vc,
        "open_meteo_archive": {
            "daily": (archive or {}).get("daily"),
        }
        if archive
        else None,
    }

    pressure = None
    visibility = None
    uv = extras_d.get("uv_index") if extras_d else None
    for src in (owm, tm, vc):
        if not src or src.get("error"):
            continue
        if pressure is None and src.get("pressure_hpa") is not None:
            pressure = src["pressure_hpa"]
        if visibility is None and src.get("visibility_km") is not None:
            visibility = src["visibility_km"]
        if uv is None and src.get("uv_index") is not None:
            uv = src["uv_index"]

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO city_extras (
              city_id, aqi, pm25, sunrise, sunset, uv_index,
              visibility_km, pressure_hpa, providers_json, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(city_id) DO UPDATE SET
              aqi=excluded.aqi,
              pm25=excluded.pm25,
              uv_index=COALESCE(excluded.uv_index, city_extras.uv_index),
              visibility_km=excluded.visibility_km,
              pressure_hpa=excluded.pressure_hpa,
              sunrise=COALESCE(city_extras.sunrise, excluded.sunrise),
              sunset=COALESCE(city_extras.sunset, excluded.sunset),
              providers_json=excluded.providers_json,
              updated_at=excluded.updated_at
            """,
            (
                city["id"],
                aqi,
                pm25,
                extras_d.get("sunrise"),
                extras_d.get("sunset"),
                uv,
                visibility,
                pressure,
                dumps(providers),
                _now_iso(),
            ),
        )
        row = conn.execute(
            "SELECT * FROM city_extras WHERE city_id = ?", (city["id"],)
        ).fetchone()
        return dict(row) if row else {}