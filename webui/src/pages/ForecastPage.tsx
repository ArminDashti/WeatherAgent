import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { api, type ForecastResponse } from "../lib/api";
import { range } from "../lib/format";
import { weatherGlyph } from "../lib/weatherIcon";

export function ForecastPage() {
  const [data, setData] = useState<ForecastResponse | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.forecast();
        if (alive) setData(res);
      } catch (e) {
        toast.error("Failed to load forecast");
        console.error(e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <CalendarDays size={22} aria-hidden className="text-[var(--wx-rain)]" />
          Forecast
        </h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">
          City grid: today, tomorrow, and the next four weekdays
        </p>
      </header>

      {!data ? (
        <p className="flex items-center gap-2 text-[var(--fg-muted)]">
          <Loader2 size={16} className="animate-spin text-[var(--wx-rain)]" aria-hidden />
          Loading…
        </p>
      ) : (
        <div className="scrollbar-thin overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg-chrome)]">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--bg)] text-left text-[var(--fg-muted)]">
                <th className="sticky left-0 z-10 bg-[var(--bg)] px-4 py-3 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} aria-hidden className="text-[var(--wx-rain)]" />
                    City
                  </span>
                </th>
                {data.columns.map((col) => (
                  <th key={col.key} className="px-3 py-3 font-medium">
                    <div className="inline-flex items-center gap-1.5">
                      <CalendarDays size={12} aria-hidden className="text-[var(--wx-partly)]" />
                      {col.label}
                    </div>
                    <div className="text-[10px] font-normal opacity-70">{col.date.slice(5)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.slug} className="border-t border-[var(--border)] hover:bg-[var(--bg-hover)]">
                  <td className="sticky left-0 z-10 bg-[var(--bg-chrome)] px-4 py-3">
                    <Link
                      to={`/cities/${row.slug}`}
                      className="inline-flex items-center gap-1.5 font-medium text-[var(--link)] hover:underline"
                    >
                      <MapPin size={12} aria-hidden className="text-[var(--wx-rain)]" />
                      {row.name_en}
                    </Link>
                    {row.name_fa ? (
                      <div className="fa text-xs text-[var(--fg-muted)]" dir="rtl">
                        {row.name_fa}
                      </div>
                    ) : null}
                  </td>
                  {data.columns.map((col) => {
                    const cell = row.days[col.key];
                    const { Icon: Weather, className: wxColor } = weatherGlyph(cell?.weather_code);
                    return (
                      <td key={col.key} className="px-3 py-3 align-top">
                        <div className="mb-1 flex items-center gap-1.5">
                          <Weather size={16} aria-hidden className={wxColor} />
                          <span className="font-semibold tabular-nums">
                            {range(cell?.temp_max_c, cell?.temp_min_c)}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--fg-muted)]">{cell?.label_en ?? "—"}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
