# WeatherAgent Design System

## Direction

- **Mode:** Operate (task tool, not marketing)
- **Theme:** Cursor Dark (armin-webui-curations tokens) — overrides ui-ux-pro-max sky/glass defaults
- **Typography:** Inter (EN chrome) + Vazirmatn (FA city names, `.fa` + `dir="rtl"`)
- **Map:** Dark Carto basemap, compact temp markers, Iran-bounded Leaflet view

## Tokens

Use CSS variables only: `--bg`, `--bg-chrome`, `--fg`, `--fg-muted`, `--border`, `--primary`, `--link`, `--success`, `--danger`, `--warning`.

## Surfaces

- Sidebar: `--bg-chrome`, active/hover = `--bg` + `--fg` (never accent-colored nav)
- Cards/tables: `--bg-chrome` + `1px solid --border` + `8px` radius
- Footer: compact, GitHub + “Created by Armin Dashti”

## Motion

- Critically damped enter on city page (`bounce: 0`, ~0.4s)
- Button press scale 0.97 / 100ms
- Honor `prefers-reduced-motion`

## Anti-patterns

- No purple gradients, no emoji icons, no auth chrome
- No wide forecast table without `overflow-x-auto`