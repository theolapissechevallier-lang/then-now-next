import { Link, useRouterState } from "@tanstack/react-router";
import {
  Hop as Home,
  Activity,
  PawPrint,
  ShoppingBag,
  Target,
  Settings,
  Trophy,
  BookHeart,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { to: "/", label: "Today", icon: Home },
  { to: "/track", label: "Track", icon: Activity },
  { to: "/journal", label: "Journal", icon: BookHeart },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/pet", label: "Pet", icon: PawPrint },
  { to: "/shop", label: "Shop", icon: ShoppingBag },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isAvailable } = useAuth();
  const hideNav = pathname === "/onboarding" || pathname === "/auth";

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background bg-hero">
      {/* Settings button in top right (only when logged in or on main pages) */}
      {!hideNav && (
        <Link
          to="/settings"
          className="absolute right-4 top-4 z-30 grid size-9 place-items-center rounded-full bg-card/80 backdrop-blur-sm border border-border"
        >
          <Settings className="size-4 text-muted-foreground" />
          {user && isAvailable && (
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary" />
          )}
        </Link>
      )}
      <main className={cn("flex-1 pb-28", hideNav && "pb-0")}>{children}</main>
      {!hideNav && (
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
          <div className="flex items-center justify-around rounded-2xl border border-border bg-card/80 px-2 py-2 shadow-soft backdrop-blur-xl">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="px-5 pt-8">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      )}
      <h1 className="mt-2 text-3xl font-bold leading-tight text-foreground">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
    </header>
  );
}
