# Surface: /cities/:slug (CityPage)

- **Mode:** Operate
- **Audience:** Operator checking one Iran city’s now + near-term weather
- **Job:** Read current conditions fast, then scan next 24h and 7-day
- **Target:** `webui/src/pages/CityPage.tsx`
- **Constraints:** Inherit Cursor Dark tokens + Layout; no new palette/fonts; keep existing data sections

## Direction contract

**THESIS:** Now-strip, then time — current conditions dominate the first viewport; equal-weight card grids are refused.

**OWN-WORLD:** Cursor Dark from `design-system/weatheragent/MASTER.md` — `--bg-chrome`, `--border`, 8px radius, Inter, Lucide, `--wx-*` glyph colors. No second brand.

**STORY:** Visitor lands from the map, confirms city + now temp at a glance, reads dense metrics, then hourly and daily.

**FIRST VIEWPORT:** Back link; one horizontal conditions band (EN name, optional FA, glyph, large temp, feels-like, labels); dense 8-metric strip in one chrome surface (not eight peer cards).

**FORM:** Instrument strip / densified Operate layout. seed: none (unavailable) — composition-only redesign inside established world; no direction roll.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
