export function temp(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Math.round(n)}°`;
}

export function range(max: number | null | undefined, min: number | null | undefined): string {
  if (max == null && min == null) return "—";
  return `${temp(max)} / ${temp(min)}`;
}