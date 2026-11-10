import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path

from app.config import settings

SCHEMA = """
CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_fa TEXT NOT NULL,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  important INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS current_weather (
  city_id INTEGER PRIMARY KEY REFERENCES cities(id),
  temp_c REAL,
  feels_like_c REAL,
  weather_code INTEGER,
  humidity REAL,
  wind_kmh REAL,
  wind_dir REAL,
  updated_at TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'open-meteo'
);

CREATE TABLE IF NOT EXISTS daily_forecast (
  city_id INTEGER NOT NULL REFERENCES cities(id),
  date TEXT NOT NULL,
  weather_code INTEGER,
  temp_max_c REAL,
  temp_min_c REAL,
  precip_mm REAL,
  PRIMARY KEY (city_id, date)
);

CREATE TABLE IF NOT EXISTS city_extras (
  city_id INTEGER PRIMARY KEY REFERENCES cities(id),
  aqi REAL,
  pm25 REAL,
  sunrise TEXT,
  sunset TEXT,
  uv_index REAL,
  visibility_km REAL,
  pressure_hpa REAL,
  providers_json TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
"""


def _ensure_parent(path: str) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)


def connect() -> sqlite3.Connection:
    _ensure_parent(settings.sqlite_path)
    conn = sqlite3.connect(settings.sqlite_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def get_db():
    conn = connect()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    with get_db() as conn:
        conn.executescript(SCHEMA)


def row_to_dict(row: sqlite3.Row | None) -> dict | None:
    if row is None:
        return None
    return dict(row)


def dumps(obj) -> str:
    return json.dumps(obj, ensure_ascii=False)


def loads(text: str | None):
    if not text:
        return None
    return json.loads(text)