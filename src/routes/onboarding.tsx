import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState, GOAL_META, type Goal } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — Future Me" }] }),
  component: Onboarding,
});

const GOALS = Object.keys(GOAL_META) as Goal[];

function Onboarding() {
  const { setProfile } = useAppState();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [age, setAge] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);

  const toggleGoal = (g: Goal) =>
    setGoals((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]));

  const finish = () => {
    setProfile({ age: Number(age) || null, goals, onboarded: true });
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col px-6 pt-12">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full",
              i <= step ? "bg-primary" : "bg-secondary",
            )}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="mt-16 flex flex-1 flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Future Me
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight">
            See who you become if you keep living{" "}
            <span className="text-gradient-future">exactly like today.</span>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            We turn your daily habits into a brutally honest projection of your future self.
          </p>
          <div className="mt-auto pb-10">
            <Button onClick={() => setStep(1)} className="h-12 w-full rounded-2xl text-base shadow-glow">
              Begin <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="mt-12 flex flex-1 flex-col">
          <h2 className="text-3xl font-bold">How old are you?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We use this to estimate how much time you really have.
          </p>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="24"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="mt-8 h-16 rounded-2xl bg-card text-center text-3xl font-bold"
          />
          <div className="mt-auto pb-10">
            <Button
              onClick={() => setStep(2)}
              disabled={!age || Number(age) < 10 || Number(age) > 100}
              className="h-12 w-full rounded-2xl text-base"
            >
              Continue <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-12 flex flex-1 flex-col">
          <h2 className="text-3xl font-bold">What's the goal?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Pick any that matter to you.</p>
          <div className="mt-6 space-y-2">
            {GOALS.map((g) => {
              const active = goals.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggleGoal(g)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all",
                    active
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <span className="flex items-center gap-3 text-base font-medium">
                    <span className="text-2xl">{GOAL_META[g].emoji}</span>
                    {GOAL_META[g].label}
                  </span>
                  {active && (
                    <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-auto pb-10 pt-6">
            <Button
              onClick={finish}
              disabled={goals.length === 0}
              className="h-12 w-full rounded-2xl text-base shadow-glow"
            >
              Meet your future self
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}