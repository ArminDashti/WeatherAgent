from __future__ import annotations

import httpx

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"


async def fetch_forecast_batch(cities: list[dict]) -> dict:
    """Batch current + daily for many lat/lon pairs."""
    lats = ",".join(str(c["lat"]) for c in cities)
    lons = ",".join(str(c["lon"]) for c in cities)
    params = {
        "latitude": lats,
        "longitude": lons,
        "current": "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m",
        "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,uv_index_max",
        "timezone": "Asia/Tehran",
        "forecast_days": 7,
        "wind_speed_unit": "kmh",
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.get(FORECAST_URL, params=params)
        r.raise_for_status()
        data = r.json()
    # Single city returns object; multi returns list
    if isinstance(data, dict) and "latitude" in data and not isinstance(data.get("latitude"), list):
        return {"results": [data]}
    # Multi-location: open-meteo returns parallel arrays or list depending on version
    if isinstance(data, list):
        return {"results": data}
    # Newer multi: top-level arrays
    n = len(cities)
    results = []
    for i in range(n):
        item = {}
        for key, val in data.items():
            if isinstance(val, list) and len(val) == n and key not in ("daily", "current", "hourly"):
                item[key] = val[i]
            elif key in ("daily", "current", "hourly") and isinstance(val, dict):
                nested = {}
                for nk, nv in val.items():
                    if isinstance(nv, list) and len(nv) == n and isinstance(nv[0], list):
                        nested[nk] = nv[i]
                    elif isinstance(nv, list) and len(nv) == n and not isinstance(nv[0], list):
                        # current scalars per location
                        nested[nk] = nv[i]
                    else:
                        nested[nk] = nv
                item[key] = nested
            else:
                item[key] = val
        results.append(item)
    return {"results": results}


async def fetch_air_quality(lat: float, lon: float) -> dict | None:
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "european_aqi,pm2_5",
        "timezone": "Asia/Tehran",
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(AIR_QUALITY_URL, params=params)
        if r.status_code >= 400:
            return None
        return r.json()


async def fetch_archive_sample(lat: float, lon: float, start: str, end: str) -> dict | None:
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start,
        "end_date": end,
        "daily": "temperature_2m_mean,precipitation_sum",
        "timezone": "Asia/Tehran",
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(ARCHIVE_URL, params=params)
        if r.status_code >= 400:
            return None
        return r.json()