import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, ArrowRight, Sparkles, TrendingUp, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState, scoreToday, project, GOAL_META } from "@/lib/store";
import { AvatarPortrait } from "@/components/avatar";
import { PetCreature } from "@/components/pet";
import { CoinPill } from "@/components/coin-pill";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Future Me — Today" },
      { name: "description", content: "Your future is being built today." },
    ],
  }),
  component: Index,
});

function Index() {
  const { state, today, pet, checkIn } = useAppState();
  const navigate = useNavigate();
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    setDateLabel(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!state.profile.onboarded && state.profile.age === null) {
      // Wait a tick to avoid hydration noise
      const t = setTimeout(() => navigate({ to: "/onboarding" }), 50);
      return () => clearTimeout(t);
    }
  }, [state.profile.onboarded, state.profile.age, navigate]);

  const score = scoreToday(today);
  const yearProjection = project(today, 365);
  const productiveMin = today.workout + today.reading + today.study + today.deepWork;

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground min-h-4">
            {dateLabel}
          </p>
          <h2 className="mt-1 truncate text-lg font-semibold">Hey, future self.</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <CoinPill value={state.coins} />
          <button
            onClick={checkIn}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold"
          >
            <Flame className="size-4 text-accent" />
            {state.profile.streak}
          </button>
        </div>
      </div>

      <section className="mt-8">
        <h1 className="text-[2rem] font-bold leading-[1.05] tracking-tight">
          Your future is{" "}
          <span className="text-gradient-future">being built today.</span>
        </h1>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <Link
          to="/avatar"
          className="group flex flex-col items-start rounded-3xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
        >
          <AvatarPortrait avatar={state.avatar} size={120} />
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your avatar
          </p>
          <p className="text-sm font-semibold">Customize →</p>
        </Link>
        <Link
          to="/pet"
          className="group flex flex-col items-start rounded-3xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
        >
          <div className="grid h-[120px] w-[120px] place-items-center">
            <PetCreature pet={pet} size={120} animate={false} />
          </div>
          <p className="mt-3 flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <PawPrint className="size-3" /> {state.pet.name} · Lv {pet.stage.level}
          </p>
          <p className="text-sm font-semibold capitalize">{pet.stage.stage} →</p>
        </Link>
      </section>

      <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Future Me score
          </p>
          <Sparkles className="size-4 text-primary" />
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-6xl font-bold text-gradient-future">{score.futureScore}</span>
          <span className="mb-2 text-sm text-muted-foreground">/ 100</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
            style={{ width: `${score.futureScore}%` }}
          />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Stat label="Discipline" value={score.discipline} />
          <Stat label="Growth" value={score.growth} />
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <MiniCard
          label="Screen today"
          value={`${today.screen}h`}
          tone={today.screen > 4 ? "danger" : "muted"}
        />
        <MiniCard
          label="Productive"
          value={`${Math.floor(productiveMin / 60)}h ${productiveMin % 60}m`}
          tone="success"
        />
      </section>

      <section className="mt-4 rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              In 1 year, this becomes
            </p>
            <p className="mt-3 text-2xl font-bold">
              {yearProjection.screenHoursLost.toLocaleString()}h scrolled
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              = {yearProjection.booksEquivalent} books unread · {yearProjection.workoutsEquivalent} workouts skipped
            </p>
          </div>
          <TrendingUp className="size-6 text-accent" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button asChild variant="secondary">
            <Link to="/future">
              Projection <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" className="border border-danger/30 text-danger">
            <Link to="/reality">Reality check</Link>
          </Button>
        </div>
      </section>

      {state.profile.goals.length > 0 && (
        <section className="mt-4 rounded-3xl border border-border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Goals you set
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {state.profile.goals.map((g) => (
              <span
                key={g}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-sm"
              >
                <span>{GOAL_META[g].emoji}</span> {GOAL_META[g].label}
              </span>
            ))}
          </div>
        </section>
      )}

      <Button asChild className="mt-6 h-12 w-full rounded-2xl text-base font-semibold shadow-glow">
        <Link to="/track">Log today's habits</Link>
      </Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-secondary p-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function MiniCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "danger" | "muted";
}) {
  const color =
    tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-foreground";
  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
