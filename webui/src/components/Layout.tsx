import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { CalendarDays, CloudSun, Map, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import clsx from "clsx";

const nav = [
  { to: "/", label: "Map", icon: Map, end: true, color: "text-[var(--wx-rain)]" },
  { to: "/forecast", label: "Forecast", icon: CalendarDays, color: "text-[var(--wx-partly)]" },
];

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-full min-h-0 bg-[var(--bg)] text-[var(--fg)]">
      <aside
        className={clsx(
          "flex shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-chrome)] transition-[width] duration-200",
          collapsed ? "w-16" : "w-56",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-[var(--border)] px-3">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[var(--fg-muted)] hover:bg-[var(--bg)] hover:text-[var(--fg)]"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          {!collapsed && (
            <div className="flex min-w-0 items-center gap-2">
              <CloudSun size={18} aria-hidden className="shrink-0 text-[var(--wx-partly)]" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold tracking-tight">WeatherAgent</div>
                <div className="truncate text-xs text-[var(--fg-muted)]">Iran weather</div>
              </div>
            </div>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2" aria-label="Main">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150",
                  isActive
                    ? "bg-[var(--bg)] text-[var(--fg)]"
                    : "text-[var(--fg-muted)] hover:bg-[var(--bg)] hover:text-[var(--fg)]",
                )
              }
            >
              <item.icon size={18} aria-hidden className={item.color} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="min-h-0 min-w-0 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}