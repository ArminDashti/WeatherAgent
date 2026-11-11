import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IranMap } from "../components/IranMap";
import { api, type CitySummary } from "../lib/api";

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
    <div className="relative h-full min-h-0">
      {loading ? (
        <div className="flex h-full items-center justify-center gap-2 text-[var(--fg-muted)]">
          <Loader2 size={18} className="animate-spin text-[var(--wx-rain)]" aria-hidden />
          Loading map…
        </div>
      ) : (
        <IranMap cities={cities} />
      )}
    </div>
  );
}
