import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { IranMap } from "../components/IranMap";
import { api, type CitySummary } from "../lib/api";
import { temp } from "../lib/format";

export function MapPage() {
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api.cities();
        if (alive) setCities(data.cities);
      } catch (e) {
        toast.error("Failed to load cities");
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <section className="relative min-h-[55vh] flex-1 lg:min-h-0">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[var(--fg-muted)]">
            Loading map…
          </div>
        ) : (
          <IranMap cities={cities} />
        )}
      </section>

      <aside className="w-full shrink-0 border-t border-[var(--border)] bg-[var(--bg-chrome)] lg:w-72 lg:border-l lg:border-t-0">
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h1 className="text-base font-semibold">Important cities</h1>
          <p className="text-xs text-[var(--fg-muted)]">Current conditions across Iran</p>
        </div>
        <ul className="scrollbar-thin max-h-[40vh] overflow-auto lg:max-h-[calc(100%-4rem)]">
          {cities.map((c) => (
            <li key={c.slug}>
              <Link
                to={`/cities/${c.slug}`}
                className="flex items-center justify-between gap-2 px-4 py-3 transition-colors duration-150 hover:bg-[var(--bg)]"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{c.name_en}</div>
                  <div className="fa truncate text-xs text-[var(--fg-muted)]" dir="rtl">
                    {c.name_fa}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">{temp(c.temp_c)}</div>
                  <div className="text-[10px] text-[var(--fg-muted)]">{c.label_en}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}