from __future__ import annotations

import httpx

from app.config import settings


async def fetch_realtime(lat: float, lon: float) -> dict | None:
    key = settings.tomorrow_api_key
    if not key:
        return None
    params = {
        "location": f"{lat},{lon}",
        "apikey": key,
        "units": "metric",
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.get(
            "https://api.tomorrow.io/v4/weather/realtime",
            params=params,
        )
        if r.status_code >= 400:
            return {"error": r.status_code}
        data = r.json()
    vals = (data.get("data") or {}).get("values") or {}
    return {
        "provider": "tomorrow",
        "temp_c": vals.get("temperature"),
        "humidity": vals.get("humidity"),
        "wind_kmh": vals.get("windSpeed"),
        "uv_index": vals.get("uvIndex"),
        "visibility_km": vals.get("visibility"),
        "weather_code": vals.get("weatherCode"),
    }