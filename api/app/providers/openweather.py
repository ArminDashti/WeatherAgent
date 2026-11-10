from __future__ import annotations

import httpx

from app.config import settings


async def fetch_current(lat: float, lon: float) -> dict | None:
    key = settings.openweathermap_api_key
    if not key:
        return None
    params = {
        "lat": lat,
        "lon": lon,
        "appid": key,
        "units": "metric",
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.get("https://api.openweathermap.org/data/2.5/weather", params=params)
        if r.status_code >= 400:
            return {"error": r.status_code}
        data = r.json()
    return {
        "provider": "openweathermap",
        "temp_c": data.get("main", {}).get("temp"),
        "feels_like_c": data.get("main", {}).get("feels_like"),
        "humidity": data.get("main", {}).get("humidity"),
        "pressure_hpa": data.get("main", {}).get("pressure"),
        "visibility_km": (data.get("visibility") or 0) / 1000.0,
        "wind_kmh": (data.get("wind", {}).get("speed") or 0) * 3.6,
        "description": (data.get("weather") or [{}])[0].get("description"),
        "icon": (data.get("weather") or [{}])[0].get("icon"),
    }