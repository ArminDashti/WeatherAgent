import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { CloudSun, PanelLeftClose, PanelLeftOpen, Settings, Table2 } from "lucide-react";
import clsx from "clsx";

const nav = [
  { to: "/", label: "Map", icon: CloudSun, end: true },
  { to: "/forecast", label: "Forecast", icon: Table2 },
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
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight">WeatherAgent</div>
              <div className="truncate text-xs text-[var(--fg-muted)]">Iran weather</div>
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
              <item.icon size={18} aria-hidden />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] p-2">
          <div
            className={clsx(
              "flex items-center gap-2 rounded-lg px-2 py-2",
              collapsed && "justify-center",
            )}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-selected)] text-xs font-semibold"
              aria-hidden
            >
              AD
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">Armin Dashti</div>
                  <div className="truncate text-xs text-[var(--fg-muted)]">Local</div>
                </div>
                <span className="text-[var(--fg-muted)]" aria-hidden>
                  <Settings size={16} />
                </span>
              </>
            )}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-auto">
          <Outlet />
        </main>
        <footer className="flex h-10 shrink-0 items-center justify-between border-t border-[var(--border)] bg-[var(--bg-chrome)] px-4 text-xs text-[var(--fg-muted)]">
          <a
            href="https://github.com/armindashti"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--link)] hover:underline"
          >
            GitHub
          </a>
          <span>Created by Armin Dashti</span>
        </footer>
      </div>
    </div>
  );
}