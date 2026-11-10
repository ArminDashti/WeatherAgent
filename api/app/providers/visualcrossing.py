from __future__ import annotations

import httpx

from app.config import settings


async def fetch_timeline(lat: float, lon: float) -> dict | None:
    key = settings.visualcrossing_api_key
    if not key:
        return None
    loc = f"{lat},{lon}"
    url = f"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{loc}/today"
    params = {
        "unitGroup": "metric",
        "key": key,
        "include": "current,days",
        "contentType": "json",
    }
    async with httpx.AsyncClient(timeout=25.0) as client:
        r = await client.get(url, params=params)
        if r.status_code >= 400:
            return {"error": r.status_code}
        data = r.json()
    current = data.get("currentConditions") or {}
    days = data.get("days") or []
    today = days[0] if days else {}
    return {
        "provider": "visualcrossing",
        "temp_c": current.get("temp"),
        "humidity": current.get("humidity"),
        "wind_kmh": current.get("windspeed"),
        "uv_index": current.get("uvindex"),
        "visibility_km": current.get("visibility"),
        "pressure_hpa": current.get("pressure"),
        "conditions": current.get("conditions"),
        "today_temp_max": today.get("tempmax"),
        "today_temp_min": today.get("tempmin"),
        "description": today.get("description"),
    }