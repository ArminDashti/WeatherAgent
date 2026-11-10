import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ChartArea,
  Droplets,
  Eye,
  Gauge,
  Layers,
  Leaf,
  Loader2,
  SunMedium,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
} from "lucide-react";
import { toast } from "sonner";
import { api, type CityDetail } from "../lib/api";
import { range, temp } from "../lib/format";
import { weatherGlyph } from "../lib/weatherIcon";

export function CityPage() {
  const { slug } = useParams();
  const [data, setData] = useState<CityDetail | null>(null);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    (async () => {
      try {
        const res = await api.city(slug);
        if (alive) setData(res);
      } catch (e) {
        toast.error("Failed to load city");
        console.error(e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  const chartData = useMemo(
    () =>
      (data?.daily ?? []).map((d) => ({
        date: d.date.slice(5),
        max: d.temp_max_c,
        min: d.temp_min_c,
      })),
    [data],
  );

  if (!data) {
    return (
      <div className="flex items-center gap-2 p-6 text-[var(--fg-muted)]">
        <Loader2 size={16} className="animate-spin text-[var(--wx-rain)]" aria-hidden />
        Loading…
      </div>
    );
  }

  const { city, current, daily, extras } = data;
  const providers = extras.providers ?? {};
  const { Icon: CurrentWeather, className: wxColor } = weatherGlyph(current?.weather_code);

  return (
    <motion.div
      className="mx-auto max-w-3xl p-4 sm:p-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
    >
      <Link
        to="/"
        className="mb-4 inline-flex h-11 items-center gap-2 rounded-lg px-2 text-sm text-[var(--fg-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg)]"
      >
        <ArrowLeft size={16} aria-hidden className="text-[var(--wx-rain)]" />
        Back to map
      </Link>

      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">{city.name_en}</h1>
        <p className="fa mt-1 text-lg text-[var(--fg-muted)]" dir="rtl">
          {city.name_fa}
        </p>
        {current && (
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-3">
              <CurrentWeather size={40} aria-hidden className={wxColor} />
              <div className="text-5xl font-semibold tabular-nums tracking-tight">
                {temp(current.temp_c)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">{current.label_en}</div>
              <div className="fa text-sm text-[var(--fg-muted)]" dir="rtl">
                {current.label_fa}
              </div>
              <div className="flex items-center gap-1 text-xs text-[var(--fg-muted)]">
                <Thermometer size={12} aria-hidden className="text-[var(--wx-temp)]" />
                Feels like {temp(current.feels_like_c)}
              </div>
            </div>
          </div>
        )}
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Droplets} iconClass="text-[var(--wx-humidity)]" label="Humidity" value={current?.humidity != null ? `${Math.round(current.humidity)}%` : "—"} />
        <Stat icon={Wind} iconClass="text-[var(--wx-wind)]" label="Wind" value={current?.wind_kmh != null ? `${Math.round(current.wind_kmh)} km/h` : "—"} />
        <Stat icon={Leaf} iconClass="text-[var(--wx-aqi)]" label="AQI" value={extras.aqi != null ? String(Math.round(extras.aqi)) : "—"} />
        <Stat icon={SunMedium} iconClass="text-[var(--wx-uv)]" label="UV" value={extras.uv_index != null ? String(Math.round(extras.uv_index)) : "—"} />
        <Stat icon={Eye} iconClass="text-[var(--wx-vis)]" label="Visibility" value={extras.visibility_km != null ? `${extras.visibility_km.toFixed(1)} km` : "—"} />
        <Stat icon={Gauge} iconClass="text-[var(--wx-pressure)]" label="Pressure" value={extras.pressure_hpa != null ? `${Math.round(extras.pressure_hpa)} hPa` : "—"} />
        <Stat icon={Sunrise} iconClass="text-[var(--wx-sunrise)]" label="Sunrise" value={extras.sunrise ? extras.sunrise.slice(11, 16) : "—"} />
        <Stat icon={Sunset} iconClass="text-[var(--wx-sunset)]" label="Sunset" value={extras.sunset ? extras.sunset.slice(11, 16) : "—"} />
      </section>

      <section className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--bg-chrome)] p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <ChartArea size={16} aria-hidden className="text-[var(--wx-temp)]" />
          7-day temperatures
        </h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="var(--fg-muted)" fontSize={12} />
              <YAxis stroke="var(--fg-muted)" fontSize={12} unit="°" />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              />
              <Area type="monotone" dataKey="max" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} name="Max" />
              <Area type="monotone" dataKey="min" stroke="var(--badge)" fill="var(--badge)" fillOpacity={0.15} name="Min" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {daily.map((d) => {
            const { Icon: DayWeather, className: dayColor } = weatherGlyph(d.weather_code);
            return (
              <div
                key={d.date}
                className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
              >
                <span className="text-[var(--fg-muted)]">{d.date}</span>
                <span className="inline-flex items-center gap-1.5 tabular-nums font-medium">
                  <DayWeather size={14} aria-hidden className={dayColor} />
                  {range(d.temp_max_c, d.temp_min_c)}
                </span>
                <span className="text-xs text-[var(--fg-muted)]">{d.label_en}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-chrome)] p-4">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Layers size={16} aria-hidden className="text-[var(--wx-vis)]" />
          Provider extras
        </h2>
        <p className="mb-3 text-xs text-[var(--fg-muted)]">
          Open-Meteo primary; OpenWeatherMap, Tomorrow.io, Visual Crossing enrich this page.
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {(["openweathermap", "tomorrow", "visualcrossing"] as const).map((key) => {
            const p = providers[key] as Record<string, unknown> | null | undefined;
            const ok = p && !p.error;
            return (
              <div key={key} className="rounded-md border border-[var(--border)] p-3 text-xs">
                <div className="mb-1 font-medium capitalize">{key.replace(/([a-z])([A-Z])/g, "$1 $2")}</div>
                <div className={ok ? "text-[var(--success)]" : "text-[var(--fg-muted)]"}>
                  {ok ? `Temp ${temp(p.temp_c as number | null)}` : p?.error ? `Error ${String(p.error)}` : "No data"}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}

function Stat({
  icon: Icon,
  iconClass,
  label,
  value,
}: {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-chrome)] p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-[var(--fg-muted)]">
        <Icon size={14} aria-hidden className={iconClass} />
        {label}
      </div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}
