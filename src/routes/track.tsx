import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import {
  Settings,
  Plus,
  Smartphone,
  Dumbbell,
  BookOpen,
  GraduationCap,
  Moon,
  Brain,
  Heart,
  DollarSign,
  Users,
  Palette,
  Music,
  Code,
  Coffee,
  Apple,
  Bike,
  Footprints,
  Timer,
  Target,
  Trophy,
  Flame,
  Zap,
  Sun,
  Star,
  Award,
  Activity,
} from "lucide-react";
import { ScreenHeader } from "@/components/app-shell";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useHabits } from "@/lib/habit-store";
import { usePet } from "@/lib/pet-store";
import {
  type Habit,
  type HabitIcon,
  calculateHabitProgress,
  calculateHabitCoins,
  calculateHabitXp,
} from "@/lib/habits";
import { XP_REWARDS } from "@/lib/pet-types";
import { cn } from "@/lib/utils";
import { CoinPill } from "@/components/coin-pill";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "Track Today — Future Me" }] }),
  component: Track,
});

const ICON_COMPONENTS: Record<HabitIcon, React.ComponentType<{ className?: string }>> = {
  Smartphone: Smartphone,
  Dumbbell: Dumbbell,
  BookOpen: BookOpen,
  GraduationCap: GraduationCap,
  Moon: Moon,
  Brain: Brain,
  Heart: Heart,
  DollarSign: DollarSign,
  Users: Users,
  Palette: Palette,
  Music: Music,
  Code: Code,
  Coffee: Coffee,
  Apple: Apple,
  Bike: Bike,
  Footprints: Footprints,
  Timer: Timer,
  Target: Target,
  Trophy: Trophy,
  Flame: Flame,
  Zap: Zap,
  Sun: Sun,
  Star: Star,
  Award: Award,
  Activity,
};

function Track() {
  const { habits, todayLogs, loading, setHabitValue, getTodaysCoins } = useHabits();
  const { pet, hasPet, addXP } = usePet();
  const { state, addCoins, addUserXp, checkIn } = useAppState();

  const handleHabitValue = useCallback(
    async (habitId: string, value: number) => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      const prevLog = todayLogs[habitId];
      const prevCoins = prevLog?.coinsEarned ?? 0;
      const prevXp = prevLog?.xpEarned ?? 0;
      const prevValue = prevLog?.value ?? 0;
      const nextCoins = calculateHabitCoins(habit, value);
      const nextXp = calculateHabitXp(habit, value);

      // Persist the log first (saves coins+xp on the row).
      await setHabitValue(habitId, value);

      // Award only the positive delta so users can't farm by editing values down/up.
      const coinsDelta = Math.max(0, nextCoins - prevCoins);
      const xpDelta = Math.max(0, nextXp - prevXp);
      if (coinsDelta > 0) await addCoins(coinsDelta);
      if (xpDelta > 0) await addUserXp(xpDelta);

      // Pet XP: fixed bonus for activity + per-habit reward.
      if (hasPet && pet) {
        const progress = calculateHabitProgress(habit, value);
        if (progress >= 1 && prevValue < habit.targetPerDay) {
          await addXP(XP_REWARDS.habitTargetMet, "goal met");
        } else if (value > 0 && prevValue === 0) {
          await addXP(XP_REWARDS.habitCompleted, "logging");
        }
        if (xpDelta > 0) await addXP(xpDelta, "habit xp");
      }

      // Streak: any positive habit log counts as a daily check-in.
      if (value > 0 && prevValue === 0) {
        await checkIn();
      }
    },
    [setHabitValue, habits, todayLogs, addCoins, addUserXp, checkIn, hasPet, pet, addXP],
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Activity className="size-6 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  const todayCoins = getTodaysCoins();

  return (
    <div>
      <header className="flex items-center justify-between px-5 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Daily tracking
        </p>
        <div className="flex items-center gap-2">
          <CoinPill value={state.coins} />
        </div>
      </header>

      <div className="px-5 mt-4">
        <h1 className="text-3xl font-bold leading-tight">What did today look like?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Be honest. Your future self is watching.
        </p>
      </div>

      {habits.length === 0 ? (
        <div className="mt-8 px-5">
          <div className="rounded-3xl border border-border bg-card p-6 text-center">
            <p className="text-muted-foreground mb-4">No habits to track yet.</p>
            <Button asChild>
              <Link to="/habits">
                <Plus className="mr-2 size-4" />
                Create your first habit
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-3 px-5">
          {habits.map((habit) => {
            const log = todayLogs[habit.id];
            const value = log?.value ?? 0;
            const Icon = ICON_COMPONENTS[habit.icon] || Activity;
            const isNegative = habit.rewardPerUnit === 0;
            const progress = calculateHabitProgress(habit, value);
            const colorClass = isNegative
              ? "text-danger"
              : habit.color === "primary"
                ? "text-primary"
                : habit.color === "accent"
                  ? "text-accent"
                  : habit.color === "success"
                    ? "text-success"
                    : habit.color === "warn"
                      ? "text-warn"
                      : "text-danger";

            return (
              <TrackRow
                key={habit.id}
                habit={habit}
                value={value}
                onChange={(v) => handleHabitValue(habit.id, v)}
                Icon={Icon}
                colorClass={colorClass}
                isNegative={isNegative}
                progress={progress}
              />
            );
          })}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <Settings className="size-4 text-muted-foreground" />
          <Link to="/habits" className="text-xs text-muted-foreground hover:text-foreground">
            Manage habits
          </Link>
        </div>
        {todayCoins > 0 && (
          <p className="text-xs text-primary font-semibold">+{todayCoins} coins today</p>
        )}
      </div>

      <p className="mt-6 px-5 text-center text-xs text-muted-foreground">
        Your entries save automatically.
      </p>
    </div>
  );
}

function TrackRow({
  habit,
  value,
  onChange,
  Icon,
  colorClass,
  isNegative,
  progress,
}: {
  habit: Habit;
  value: number;
  onChange: (v: number) => void;
  Icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  isNegative: boolean;
  progress: number;
}) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (v: number[]) => {
    const newValue = v[0] ?? 0;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const max =
    habit.unit === "hours"
      ? 16
      : habit.unit === "minutes"
        ? 180
        : habit.unit === "steps"
          ? 20000
          : habit.unit === "pages"
            ? 100
            : 50;

  const step =
    habit.unit === "hours" ? 0.5 : habit.unit === "minutes" ? 5 : habit.unit === "steps" ? 1000 : 1;

  const displayValue = habit.unit === "hours" ? localValue.toFixed(1) : Math.round(localValue);

  const unitLabel = habit.unit;

  return (
    <div className="rounded-3xl border border-border bg-card p-5 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn("grid size-10 place-items-center rounded-xl bg-secondary", colorClass)}
          >
            <Icon className="size-5" />
          </span>
          <div>
            <p className="text-base font-semibold">{habit.name}</p>
            <p className="text-xs text-muted-foreground">
              {habit.targetPerDay} {habit.unit}/day
              {isNegative
                ? " (tracking only)"
                : habit.rewardPerUnit > 0
                  ? ` · ${habit.rewardPerUnit}c per unit`
                  : ""}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold tabular-nums">{displayValue}</span>
          <span className="ml-1 text-xs text-muted-foreground">{unitLabel}</span>
        </div>
      </div>

      <Slider
        className="mt-4"
        value={[localValue]}
        max={max}
        step={step}
        onValueChange={(v) => setLocalValue(v[0] ?? 0)}
        onValueCommit={handleChange}
      />

      {/* Progress bar */}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isNegative ? "bg-danger" : progress >= 1 ? "bg-primary" : "bg-primary/60",
          )}
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
