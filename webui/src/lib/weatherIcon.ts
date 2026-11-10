import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from "lucide-react";

export type WeatherGlyph = {
  Icon: LucideIcon;
  /** CSS class that paints the Lucide stroke */
  className: string;
};

/** Map Open-Meteo / WMO weather_code to a colored Lucide glyph. */
export function weatherGlyph(code: number | null | undefined): WeatherGlyph {
  if (code == null) return { Icon: Cloud, className: "text-[var(--wx-cloud)]" };
  if (code === 0 || code === 1) return { Icon: Sun, className: "text-[var(--wx-sun)]" };
  if (code === 2) return { Icon: CloudSun, className: "text-[var(--wx-partly)]" };
  if (code === 3) return { Icon: Cloud, className: "text-[var(--wx-cloud)]" };
  if (code === 45 || code === 48) return { Icon: CloudFog, className: "text-[var(--wx-fog)]" };
  if (code >= 51 && code <= 57) return { Icon: CloudDrizzle, className: "text-[var(--wx-rain)]" };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return { Icon: CloudRain, className: "text-[var(--wx-rain)]" };
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return { Icon: CloudSnow, className: "text-[var(--wx-snow)]" };
  }
  if (code >= 95 && code <= 99) return { Icon: CloudLightning, className: "text-[var(--wx-storm)]" };
  return { Icon: Cloud, className: "text-[var(--wx-cloud)]" };
}
