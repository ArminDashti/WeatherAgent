import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api, type ForecastResponse } from "../lib/api";
import { range } from "../lib/format";

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
        <h1 className="text-2xl font-semibold tracking-tight">Forecast</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">
          City grid: today, tomorrow, and the next four weekdays
        </p>
      </header>

      {!data ? (
        <p className="text-[var(--fg-muted)]">Loading…</p>
      ) : (
        <div className="scrollbar-thin overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg-chrome)]">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--bg)] text-left text-[var(--fg-muted)]">
                <th className="sticky left-0 z-10 bg-[var(--bg)] px-4 py-3 font-medium">City</th>
                {data.columns.map((col) => (
                  <th key={col.key} className="px-3 py-3 font-medium">
                    <div>{col.label}</div>
                    <div className="text-[10px] font-normal opacity-70">{col.date.slice(5)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.slug} className="border-t border-[var(--border)] hover:bg-[var(--bg-hover)]">
                  <td className="sticky left-0 z-10 bg-[var(--bg-chrome)] px-4 py-3">
                    <Link to={`/cities/${row.slug}`} className="font-medium text-[var(--link)] hover:underline">
                      {row.name_en}
                    </Link>
                    <div className="fa text-xs text-[var(--fg-muted)]" dir="rtl">
                      {row.name_fa}
                    </div>
                  </td>
                  {data.columns.map((col) => {
                    const cell = row.days[col.key];
                    return (
                      <td key={col.key} className="px-3 py-3 align-top">
                        <div className="font-semibold tabular-nums">
                          {range(cell?.temp_max_c, cell?.temp_min_c)}
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