import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Dumbbell, Languages, DollarSign, Clock } from "lucide-react";
import { ScreenHeader } from "@/components/app-shell";
import { useAppState, project } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/future")({
  head: () => ({ meta: [{ title: "Projections — Future Me" }] }),
  component: Future,
});

const HORIZONS = [
  { days: 30, label: "1 month" },
  { days: 365, label: "1 year" },
  { days: 365 * 5, label: "5 years" },
  { days: 365 * 10, label: "10 years" },
] as const;

function Future() {
  const { today } = useAppState();
  const [idx, setIdx] = useState(1);
  const horizon = HORIZONS[idx];
  const p = project(today, horizon.days);

  return (
    <div>
      <ScreenHeader
        eyebrow="Projection engine"
        title="If today repeats..."
        subtitle="This is the math of your habits, extended forward."
      />

      <div className="mt-6 flex gap-2 overflow-x-auto px-5 pb-2">
        {HORIZONS.map((h, i) => (
          <button
            key={h.days}
            onClick={() => setIdx(i)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              i === idx
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {h.label}
          </button>
        ))}
      </div>

      <section className="mt-4 px-5">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Hours lost to screens
          </p>
          <p className="mt-3 text-5xl font-bold text-gradient-future">
            {p.screenHoursLost.toLocaleString()}h
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            That's {Math.round(p.screenHoursLost / 24).toLocaleString()} full days awake.
          </p>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 px-5">
        <Equiv icon={Dumbbell} value={`${p.workoutsEquivalent.toLocaleString()}`} label="workouts skipped" />
        <Equiv icon={BookOpen} value={`${p.booksEquivalent.toLocaleString()}`} label="books unread" />
        <Equiv icon={Languages} value={`${p.languagesEquivalent}`} label="languages unlearned" />
        <Equiv icon={DollarSign} value={`$${p.moneyEquivalent.toLocaleString()}`} label="potential earnings" />
      </section>

      <section className="mt-6 px-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          What you WILL build
        </h3>
        <div className="mt-3 space-y-2">
          <Built icon={Dumbbell} value={p.workoutsCompleted} label="workouts completed" />
          <Built icon={BookOpen} value={p.booksRead} label="books read" />
          <Built icon={Clock} value={p.studyHours} label="hours studied" />
        </div>
      </section>

      <p className="mx-5 mt-8 rounded-2xl border border-border bg-secondary/40 p-4 text-center text-sm italic text-muted-foreground">
        "Compound interest is the eighth wonder of the world."
      </p>
    </div>
  );
}

function Equiv({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <Icon className="size-5 text-accent" />
      <p className="mt-3 text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Built({ icon: Icon, value, label }: { icon: LucideIcon; value: number; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-secondary">
          <Icon className="size-4 text-primary" />
        </span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-xl font-bold tabular-nums text-success">{value.toLocaleString()}</span>
    </div>
  );
}