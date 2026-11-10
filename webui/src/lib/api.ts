const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export type CitySummary = {
  id: number;
  slug: string;
  name_en: string;
  lat: number;
  lon: number;
  temp_c: number | null;
  feels_like_c: number | null;
  weather_code: number | null;
  humidity: number | null;
  wind_kmh: number | null;
  label_en: string;
  weather_updated_at: string | null;
};

export type DayCell = {
  date: string;
  weather_code: number | null;
  label_en: string;
  temp_max_c: number | null;
  temp_min_c: number | null;
  precip_mm: number | null;
} | null;

export type ForecastResponse = {
  columns: { key: string; label: string; date: string }[];
  rows: {
    slug: string;
    name_en: string;
    days: Record<string, DayCell>;
  }[];
};

export type CityDetail = {
  city: {
    id: number;
    slug: string;
    name_en: string;
    lat: number;
    lon: number;
  };
  current: {
    temp_c: number | null;
    feels_like_c: number | null;
    weather_code: number | null;
    humidity: number | null;
    wind_kmh: number | null;
    wind_dir: number | null;
    label_en: string;
    updated_at: string;
  } | null;
  daily: {
    date: string;
    weather_code: number | null;
    temp_max_c: number | null;
    temp_min_c: number | null;
    precip_mm: number | null;
    label_en: string;
  }[];
  extras: {
    aqi: number | null;
    pm25: number | null;
    sunrise: string | null;
    sunset: string | null;
    uv_index: number | null;
    visibility_km: number | null;
    pressure_hpa: number | null;
    providers: Record<string, unknown> | null;
  };
};

export const api = {
  health: () => get<{ ok: boolean; cities: number; last_sync: string | null }>("/api/health"),
  cities: () => get<{ cities: CitySummary[] }>("/api/cities"),
  forecast: () => get<ForecastResponse>("/api/forecast"),
  city: (slug: string) => get<CityDetail>(`/api/cities/${slug}`),
};
