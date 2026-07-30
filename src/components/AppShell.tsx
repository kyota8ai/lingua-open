import { NavLink, Outlet } from "react-router";
import { CardsThree, ClockCounterClockwise, GearSix, StackSimple } from "@phosphor-icons/react";
import { PrivacyBadge } from "./PrivacyBadge";
import { Logo } from "./Logo";

const NAV = [
  { to: "/", label: "Practice", icon: CardsThree, end: true },
  { to: "/review", label: "Review", icon: StackSimple, end: false },
  { to: "/history", label: "History", icon: ClockCounterClockwise, end: false },
  { to: "/settings", label: "Settings", icon: GearSix, end: false },
];

function navClass(isActive: boolean) {
  return [
    "flex items-center gap-3 h-12 px-4 rounded-(--radius-control) text-[15px] font-medium transition-colors duration-150",
    isActive ? "bg-accent-soft text-on-accent-soft" : "text-ink-muted hover:bg-sunken hover:text-ink",
  ].join(" ");
}

export function AppShell() {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col gap-1 border-r border-line bg-surface px-4 py-6 sticky top-0 h-dvh">
        <a href="/" className="flex items-center gap-2.5 px-2 mb-6" aria-label="lingua-open home">
          <Logo className="text-ink" />
        </a>
        <nav aria-label="Main" className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => navClass(isActive)}>
              <Icon size={20} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <PrivacyBadge />
        </div>
      </aside>

      {/* Content */}
      <div className="pb-24 lg:pb-0">
        <Outlet />
      </div>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Main"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-line pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-4">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  isActive ? "text-accent-text" : "text-ink-faint",
                ].join(" ")
              }
            >
              <Icon size={22} aria-hidden />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
