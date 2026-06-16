import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Activity, Plus } from "lucide-react";
import { ScreenHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useAppState, project } from "@/lib/store";
import { useDerivedToday } from "@/lib/projection-bridge";

export const Route = createFileRoute("/reality")({
  head: () => ({ meta: [{ title: "Reality Check — Future Me" }] }),
  component: Reality,
});

function Reality() {
  const { state } = useAppState();
  const { entry, loading, hasAnyData, habitsCount } = useDerivedToday();
  const age = state.profile.age ?? 25;
  const targetAge = age + 10;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Activity className="size-6 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  if (!hasAnyData) {
    return (
      <div>
        <ScreenHeader
          eyebrow="Reality check"
          title="Track today first"
          subtitle="We need at least one logged habit to project 10 years ahead."
        />
        <div className="mt-8 px-5">
          <Button asChild className="h-12 w-full rounded-2xl">
            <Link to={habitsCount === 0 ? "/habits" : "/track"}>
              <Plus className="mr-2 size-4" />
              {habitsCount === 0 ? "Create a habit" : "Log today"}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const p10 = project(entry, 365 * 10);

  const lines = [
    { big: `${p10.screenHoursLost.toLocaleString()}h`, small: "lost to scrolling" },
    { big: `${p10.booksEquivalent}`, small: "books you never read" },
    { big: `${p10.workoutsEquivalent.toLocaleString()}`, small: "workouts you skipped" },
    { big: `${p10.languagesEquivalent}`, small: "languages you didn't learn" },
    { big: `$${p10.moneyEquivalent.toLocaleString()}`, small: "you didn't earn" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <ScreenHeader
        eyebrow="Reality check"
        title="If nothing changes..."
        subtitle={`At ${targetAge}, this is what today's habits compound into.`}
      />

      <div className="mt-8 space-y-1 px-5">
        {lines.map((l, i) => (
          <div
            key={i}
            className="border-b border-border py-5 last:border-b-0"
            style={{ opacity: 1 - i * 0.08 }}
          >
            <p className="text-4xl font-bold tracking-tight text-danger">{l.big}</p>
            <p className="mt-1 text-sm text-muted-foreground">{l.small}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 px-5">
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6">
          <Flame className="size-6 text-primary" />
          <h3 className="mt-3 text-xl font-bold">It's not too late.</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            One small change today, repeated, becomes a different life. Start with 15 minutes.
          </p>
          <Button asChild className="mt-5 h-12 w-full rounded-2xl shadow-glow">
            <Link to="/track">Change today</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}