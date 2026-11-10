# WeatherAgent

Iran-focused weather WebUI + REST API. Cursor Dark theme, no auth, SQLite cache.

## Stack

| Piece | Tech |
|-------|------|
| API | FastAPI + SQLite + APScheduler |
| WebUI | Vite + React + Tailwind + Leaflet |
| Weather | Open-Meteo (primary) + OpenWeatherMap + Tomorrow.io + Visual Crossing |

## Secrets (Infisical)

Project: **Example Project** · env: **dev** · path: `/`

| Name | Use |
|------|-----|
| `OPENWEATHERMAP_API_KEY` | City-page enrichment / fallback |
| `TOMORROW_API_KEY` | City-page enrichment / fallback |
| `VISUALCROSSING_API_KEY` | City-page enrichment / fallback |

Open-Meteo public HTTP APIs need no key. Copy `.env.example` → `.env` and fill names from Infisical (never commit `.env`).

## Run (Docker)

```bash
docker compose up -d --build --force-recreate
```

- WebUI: http://localhost:8781
- API: http://localhost:8780/api/health

## Run (local)

```bash
# API
cd api
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
$env:SQLITE_PATH="..\data\weather.db"
.\.venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8780

# WebUI
cd webui
npm install --prefer-offline --no-audit --no-fund
npm run dev
```

## Pages

- `/` — Iran map + current temps for important cities
- `/forecast` — grid: City, Today, Tomorrow, Su/Mo…
- `/cities/:slug` — city detail + multi-provider extras

## API

- `GET /api/health`
- `GET /api/cities`
- `GET /api/forecast`
- `GET /api/cities/{slug}`
- `POST /api/sync`