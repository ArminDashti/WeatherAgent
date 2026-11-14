import { useCallback, useEffect, useMemo, useState } from "react";
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
  Clock,
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

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: CityDetail };

export function CityPage() {
  const { slug } = useParams();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(async (citySlug: string, signal?: { alive: boolean }) => {
    setState({ status: "loading" });
    try {
      const res = await api.city(citySlug);
      if (signal && !signal.alive) return;
      setState({ status: "ready", data: res });
    } catch (e) {
      if (signal && !signal.alive) return;
      const message = e instanceof Error ? e.message : "Failed to load city";
      toast.error("Failed to load city");
      console.error(e);
      setState({ status: "error", message });
    }
  }, []);

  useEffect(() => {
    if (!slug) return;
    const signal = { alive: true };
    void load(slug, signal);
    return () => {
      signal.alive = false;
    };
  }, [slug, load]);

  const chartData = useMemo(
    () =>
      (state.status === "ready" ? state.data.daily : []).map((d) => ({
        date: d.date.slice(5),
        max: d.temp_max_c,
        min: d.temp_min_c,
      })),
    [state],
  );

  const hourlyChart = useMemo(
    () =>
      (state.status === "ready" ? state.data.hourly : []).map((h) => ({
        hour: h.time.slice(11, 16),
        temp: h.temp_c,
      })),
    [state],
  );

  if (state.status === "loading") {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6" aria-busy="true" aria-live="polite">
        <div className="h-4 w-28 animate-pulse rounded bg-[var(--bg-chrome)]" />
        <div className="h-28 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--bg-chrome)]" />
        <div className="h-16 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--bg-chrome)]" />
        <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
          <Loader2 size={16} className="animate-spin text-[var(--wx-rain)]" aria-hidden />
          Loading city…
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        <Link
          to="/"
          className="mb-4 inline-flex h-11 items-center gap-2 rounded-lg px-2 text-sm text-[var(--fg-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg)]"
        >
          <ArrowLeft size={16} aria-hidden className="text-[var(--wx-rain)]" />
          Back to map
        </Link>
        <div
          role="alert"
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-chrome)] p-5"
        >
          <h1 className="text-lg font-semibold">Could not load this city</h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">{state.message}</p>
          <button
            type="button"
            className="mt-4 inline-flex h-10 items-center rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-sm font-medium hover:bg-[var(--bg-hover)]"
            onClick={() => slug && void load(slug)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { city, current, hourly, daily, extras } = state.data;
  const providers = extras.providers ?? {};
  const { Icon: CurrentWeather, className: wxColor } = weatherGlyph(current?.weather_code);

  const metrics: { icon: LucideIcon; iconClass: string; label: string; value: string }[] = [
    {
      icon: Droplets,
      iconClass: "text-[var(--wx-humidity)]",
      label: "Humidity",
      value: current?.humidity != null ? `${Math.round(current.humidity)}%` : "—",
    },
    {
      icon: Wind,
      iconClass: "text-[var(--wx-wind)]",
      label: "Wind",
      value: current?.wind_kmh != null ? `${Math.round(current.wind_kmh)} km/h` : "—",
    },
    {
      icon: Leaf,
      iconClass: "text-[var(--wx-aqi)]",
      label: "AQI",
      value: extras.aqi != null ? String(Math.round(extras.aqi)) : "—",
    },
    {
      icon: SunMedium,
      iconClass: "text-[var(--wx-uv)]",
      label: "UV",
      value: extras.uv_index != null ? String(Math.round(extras.uv_index)) : "—",
    },
    {
      icon: Eye,
      iconClass: "text-[var(--wx-vis)]",
      label: "Visibility",
      value: extras.visibility_km != null ? `${extras.visibility_km.toFixed(1)} km` : "—",
    },
    {
      icon: Gauge,
      iconClass: "text-[var(--wx-pressure)]",
      label: "Pressure",
      value: extras.pressure_hpa != null ? `${Math.round(extras.pressure_hpa)} hPa` : "—",
    },
    {
      icon: Sunrise,
      iconClass: "text-[var(--wx-sunrise)]",
      label: "Sunrise",
      value: extras.sunrise ? extras.sunrise.slice(11, 16) : "—",
    },
    {
      icon: Sunset,
      iconClass: "text-[var(--wx-sunset)]",
      label: "Sunset",
      value: extras.sunset ? extras.sunset.slice(11, 16) : "—",
    },
  ];

  return (
    <motion.div
      className="mx-auto max-w-4xl p-4 sm:p-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
    >
      <Link
        to="/"
        className="mb-3 inline-flex h-11 items-center gap-2 rounded-lg px-2 text-sm text-[var(--fg-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg)]"
      >
        <ArrowLeft size={16} aria-hidden className="text-[var(--wx-rain)]" />
        Back to map
      </Link>

      <header className="mb-3 rounded-lg border border-[var(--border)] bg-[var(--bg-chrome)] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{city.name_en}</h1>
            {city.name_fa ? (
              <p className="fa mt-0.5 text-base text-[var(--fg-muted)]" dir="rtl">
                {city.name_fa}
              </p>
            ) : null}
          </div>
          {current ? (
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex items-center gap-3">
                <CurrentWeather size={40} aria-hidden className={wxColor} />
                <div className="text-5xl font-semibold tabular-nums tracking-tight">
                  {temp(current.temp_c)}
                </div>
              </div>
              <div className="pb-1">
                <div className="text-sm font-medium">{current.label_en}</div>
                {current.label_fa ? (
                  <div className="fa text-sm text-[var(--fg-muted)]" dir="rtl">
                    {current.label_fa}
                  </div>
                ) : null}
                <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--fg-muted)]">
                  <Thermometer size={12} aria-hidden className="text-[var(--wx-temp)]" />
                  Feels like {temp(current.feels_like_c)}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--fg-muted)]">No current observation</p>
          )}
        </div>
      </header>

      <section
        aria-label="Current metrics"
        className="mb-6 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-chrome)]"
      >
        <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
          {metrics.map((m, i) => (
            <MetricCell key={m.label} {...m} edge={i % 2 === 1} />
          ))}
        </ul>
      </section>

      <section className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--bg-chrome)] p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Clock size={16} aria-hidden className="text-[var(--wx-partly)]" />
          Next 24 hours
        </h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyChart}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="hour" stroke="var(--fg-muted)" fontSize={11} interval={2} />
              <YAxis stroke="var(--fg-muted)" fontSize={12} unit="°" width={36} />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.2}
                name="Temp"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="scrollbar-thin mt-3 flex gap-2 overflow-x-auto pb-1">
          {hourly.map((h) => {
            const { Icon: HourWeather, className: hourColor } = weatherGlyph(h.weather_code);
            return (
              <div
                key={h.time}
                className="flex w-14 shrink-0 flex-col items-center gap-1 px-1 py-1.5 text-center text-xs"
              >
                <span className="text-[var(--fg-muted)]">{h.time.slice(11, 16)}</span>
                <HourWeather size={16} aria-hidden className={hourColor} />
                <span className="tabular-nums font-semibold">{temp(h.temp_c)}</span>
              </div>
            );
          })}
        </div>
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
              <Area
                type="monotone"
                dataKey="max"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.2}
                name="Max"
              />
              <Area
                type="monotone"
                dataKey="min"
                stroke="var(--badge)"
                fill="var(--badge)"
                fillOpacity={0.15}
                name="Min"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 divide-y divide-[var(--border)]">
          {daily.map((d) => {
            const { Icon: DayWeather, className: dayColor } = weatherGlyph(d.weather_code);
            return (
              <div
                key={d.date}
                className="flex items-center justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
              >
                <span className="w-24 shrink-0 text-[var(--fg-muted)]">{d.date}</span>
                <span className="inline-flex min-w-0 flex-1 items-center gap-1.5 tabular-nums font-medium">
                  <DayWeather size={14} aria-hidden className={dayColor} />
                  {range(d.temp_max_c, d.temp_min_c)}
                </span>
                <span className="truncate text-xs text-[var(--fg-muted)]">{d.label_en}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-chrome)] px-4 py-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--fg-muted)]">
          <Layers size={14} aria-hidden className="text-[var(--wx-vis)]" />
          Provider extras
          <span className="font-normal">
            · Open-Meteo primary; OWM / Tomorrow.io / Visual Crossing enrich
          </span>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
          {(["openweathermap", "tomorrow", "visualcrossing"] as const).map((key) => {
            const p = providers[key] as Record<string, unknown> | null | undefined;
            const ok = Boolean(p && !p.error);
            const label = key.replace(/([a-z])([A-Z])/g, "$1 $2");
            return (
              <div key={key} className="inline-flex items-baseline gap-1.5">
                <span className="capitalize text-[var(--fg-muted)]">{label}</span>
                <span className={ok ? "text-[var(--success)]" : "text-[var(--fg-muted)]"}>
                  {ok
                    ? temp(p!.temp_c as number | null)
                    : p?.error
                      ? `Error ${String(p.error)}`
                      : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}

function MetricCell({
  icon: Icon,
  iconClass,
  label,
  value,
  edge,
}: {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: string;
  edge: boolean;
}) {
  return (
    <li
      className={`border-[var(--border)] px-3 py-2.5 ${
        edge ? "border-l" : ""
      } sm:border-l sm:[&:nth-child(4n+1)]:border-l-0 lg:[&:nth-child(4n+1)]:border-l lg:[&:nth-child(8n+1)]:border-l-0`}
    >
      <div className="flex items-center gap-1 text-[11px] leading-tight text-[var(--fg-muted)]">
        <Icon size={12} aria-hidden className={iconClass} />
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums">{value}</div>
    </li>
  );
}
