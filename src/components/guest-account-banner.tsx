import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useGoals } from "@/lib/goals-store";
import { useAchievements } from "@/lib/achievements-store";
import { useAppState } from "@/lib/store";
import { hasMeaningfulGuestProgress } from "@/lib/guest-store";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "future-me:guest:banner-dismissed";

// Soft prompt to convert guests once they have meaningful progress.
// Dismissible — silently stays gone until the user clears localStorage.
export function GuestAccountBanner({ className }: { className?: string }) {
  const { user, isAvailable } = useAuth();
  const { goals } = useGoals();
  const { unlocked } = useAchievements();
  const { state } = useAppState();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (user || !isAvailable || dismissed) return null;

  const hasProgress = hasMeaningfulGuestProgress({
    goals: goals.length,
    unlocked: unlocked.length,
    habitLogs: Object.keys(state.entries).length,
    coins: state.coins,
  });
  if (!hasProgress) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") localStorage.setItem(DISMISS_KEY, "1");
  };

  return (
    <div
      data-testid="guest-account-banner"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card/70 to-accent/10 p-4 pr-10",
        className,
      )}
    >
      <button
        type="button"
        onClick={handleDismiss}
        data-testid="guest-banner-dismiss"
        aria-label="Dismiss"
        className="absolute right-2 top-2 grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary">
          <Sparkles className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight text-foreground">
            Save your progress forever — create a free account.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Your trophies, habits and pet live in this browser only. Sign up to sync across devices.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to="/auth"
              data-testid="guest-banner-signup"
              className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow hover:bg-primary/90"
            >
              Create free account
            </Link>
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex items-center justify-center rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
