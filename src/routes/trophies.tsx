import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Trophy,
  Lock,
  Share2,
  Flame,
  PawPrint,
  Target,
  ListChecks,
  Sparkles,
  Coins,
  Zap,
} from "lucide-react";
import { ScreenHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useAchievements } from "@/lib/achievements-store";
import { useGoals } from "@/lib/goals-store";
import { useAppState } from "@/lib/store";
import { GuestAccountBanner } from "@/components/guest-account-banner";
import {
  ACHIEVEMENTS,
  RARITY_STYLE,
  findAchievement,
  type AchievementCategory,
  type AchievementDef,
  type AchievementRarity,
} from "@/lib/achievements";
import { PixelBadge, PixelTrophy } from "@/components/pixel-trophy";
import { shareCard } from "@/lib/share-card";
import type { Goal } from "@/lib/goals";

export const Route = createFileRoute("/trophies")({
  component: TrophyRoom,
});

const CATEGORY_TABS: { value: "all" | AchievementCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "goals", label: "Goals" },
  { value: "streak", label: "Streak" },
  { value: "pet", label: "Pet" },
  { value: "habits", label: "Habits" },
  { value: "special", label: "Special" },
];

const ICON_FOR: Record<AchievementCategory, "goal" | "streak" | "pet" | "habits" | "special"> = {
  goals: "goal",
  streak: "streak",
  pet: "pet",
  habits: "habits",
  special: "special",
};

function TrophyRoom() {
  const { user } = useAuth();
  const { unlocked, loading, stats, score, rarest, completionPct } = useAchievements();
  const { goals } = useGoals();
  const { state } = useAppState();
  const [tab, setTab] = useState<"all" | AchievementCategory>("all");
  const [open, setOpen] = useState<AchievementDef | null>(null);
  const [goalOpen, setGoalOpen] = useState<Goal | null>(null);

  const unlockedIds = useMemo(() => new Set(unlocked.map((u) => u.achievementId)), [unlocked]);
  const unlockedMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const u of unlocked) m[u.achievementId] = u.unlockedAt;
    return m;
  }, [unlocked]);

  const list = useMemo(
    () => (tab === "all" ? ACHIEVEMENTS : ACHIEVEMENTS.filter((a) => a.category === tab)),
    [tab],
  );

  const completedGoals = useMemo(
    () =>
      goals
        .filter((g) => g.status === "completed" || g.status === "archived")
        .sort(
          (a, b) =>
            Date.parse(b.completedAt ?? b.updatedAt) - Date.parse(a.completedAt ?? a.updatedAt),
        ),
    [goals],
  );

  return (
    <div className="pb-10" data-testid="trophy-room">
      <ScreenHeader
        eyebrow="Trophy Room"
        title="Your hall of fame"
        subtitle="Every goal crushed, streak survived, pet evolved — preserved forever."
      />

      {!user && (
        <div className="px-5 pt-6">
          <GuestAccountBanner />
        </div>
      )}
      {/* Prestige header */}
      <div className="px-5 pt-6">
        <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-card/70 to-fuchsia-500/10 p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 size-40 opacity-20">
            <PixelTrophy rarity="legendary" size={160} />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
            <Sparkles className="size-4" /> Prestige
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Stat
              label="Achievement score"
              value={score.toLocaleString()}
              data-testid="prestige-score"
            />
            <Stat
              label="Trophies"
              value={`${unlocked.length} / ${ACHIEVEMENTS.length}`}
              data-testid="prestige-count"
            />
            <Stat label="Completion" value={`${completionPct}%`} data-testid="prestige-percent" />
            <Stat
              label="Rarest"
              value={rarest ? RARITY_STYLE[rarest.rarity].label : "—"}
              valueClass={rarest ? RARITY_STYLE[rarest.rarity].text : ""}
              data-testid="prestige-rarest"
            />
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-fuchsia-400 to-sky-400 transition-all"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="mt-4 grid grid-cols-3 gap-2 px-5 text-center">
        <MiniStat
          icon={<Target className="size-3.5" />}
          value={stats.goalsCompleted}
          label="Goals"
        />
        <MiniStat
          icon={<Flame className="size-3.5" />}
          value={stats.currentStreak}
          label="Streak"
        />
        <MiniStat icon={<PawPrint className="size-3.5" />} value={stats.petXp} label="Pet XP" />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-6">
        <div className="px-5">
          <TabsList className="grid w-full grid-cols-6">
            {CATEGORY_TABS.map((c) => (
              <TabsTrigger
                key={c.value}
                value={c.value}
                className="text-[10px]"
                data-testid={`tab-${c.value}`}
              >
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {CATEGORY_TABS.map((c) => (
          <TabsContent key={c.value} value={c.value} className="mt-4 px-5">
            {loading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {list.map((a) => (
                  <AchievementTile
                    key={a.id}
                    def={a}
                    unlocked={unlockedIds.has(a.id)}
                    onClick={() => setOpen(a)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Completed Goals trophy gallery */}
      {completedGoals.length > 0 && (
        <section className="mt-10 px-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-foreground">Completed Goals</h2>
            <Link
              to="/goals"
              className="text-xs font-semibold text-primary hover:underline"
              data-testid="link-goals-tab"
            >
              View all →
            </Link>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {completedGoals.length} permanent achievement{completedGoals.length === 1 ? "" : "s"}.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {completedGoals.slice(0, 8).map((g) => (
              <GoalTrophyCard key={g.id} goal={g} onClick={() => setGoalOpen(g)} />
            ))}
          </div>
        </section>
      )}

      <AchievementDetailDialog
        def={open}
        unlockedAt={open ? unlockedMap[open.id] : undefined}
        onOpenChange={(o) => !o && setOpen(null)}
      />

      <GoalTrophyDialog goal={goalOpen} onOpenChange={(o) => !o && setGoalOpen(null)} />
    </div>
  );
}

function Stat({
  label,
  value,
  valueClass,
  "data-testid": testId,
}: {
  label: string;
  value: string;
  valueClass?: string;
  "data-testid"?: string;
}) {
  return (
    <div data-testid={testId}>
      <div className={cn("text-2xl font-extrabold leading-none text-foreground", valueClass)}>
        {value}
      </div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 px-2 py-2">
      <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-base font-bold text-foreground">{value.toLocaleString()}</div>
    </div>
  );
}

function AchievementTile({
  def,
  unlocked,
  onClick,
}: {
  def: AchievementDef;
  unlocked: boolean;
  onClick: () => void;
}) {
  const r = RARITY_STYLE[def.rarity];
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`tile-${def.id}`}
      className={cn(
        "group relative flex aspect-square flex-col items-center justify-between rounded-2xl border bg-card/70 p-3 text-center transition-transform active:scale-[0.97]",
        unlocked ? r.border : "border-border",
        unlocked && r.glow,
      )}
    >
      <span
        className={cn(
          "self-start rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider",
          unlocked ? r.chip : "border-border bg-secondary/60 text-muted-foreground",
        )}
      >
        {unlocked ? r.label : "Locked"}
      </span>

      <div className="relative flex h-16 w-16 items-center justify-center">
        {unlocked ? (
          <PixelBadge rarity={def.rarity} size={64} icon={ICON_FOR[def.category]} />
        ) : (
          <div className="relative flex h-16 w-16 items-center justify-center">
            <PixelBadge
              rarity={def.rarity}
              size={64}
              icon={ICON_FOR[def.category]}
              className="opacity-25 grayscale"
            />
            <Lock className="absolute size-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <p
        className={cn(
          "line-clamp-2 text-[10px] font-semibold leading-tight",
          unlocked ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {def.title}
      </p>
    </button>
  );
}

function GoalTrophyCard({ goal, onClick }: { goal: Goal; onClick: () => void }) {
  // Map goal difficulty to rarity for visual consistency.
  const rarity: AchievementRarity =
    goal.difficulty === "hard" ? "epic" : goal.difficulty === "medium" ? "rare" : "common";
  const r = RARITY_STYLE[rarity];
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`goal-trophy-${goal.id}`}
      className={cn(
        "group flex aspect-square flex-col items-center justify-between rounded-2xl border bg-card/70 p-3 text-center transition-transform active:scale-[0.97]",
        r.border,
        r.glow,
      )}
    >
      <span
        className={cn(
          "self-start rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
          r.chip,
        )}
      >
        {r.label}
      </span>
      <PixelTrophy rarity={rarity} size={64} />
      <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-foreground">
        {goal.title}
      </p>
    </button>
  );
}

function AchievementDetailDialog({
  def,
  unlockedAt,
  onOpenChange,
}: {
  def: AchievementDef | null;
  unlockedAt?: string;
  onOpenChange: (o: boolean) => void;
}) {
  if (!def) {
    return (
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }
  const r = RARITY_STYLE[def.rarity];
  const unlocked = !!unlockedAt;

  const onShare = async () => {
    try {
      const result = await shareCard({
        title: def.title,
        subtitle: def.description,
        rarity: def.rarity,
        chips: [`+${r.score} prestige`],
        footer: unlockedAt ? `Unlocked ${new Date(unlockedAt).toLocaleDateString()}` : undefined,
      });
      if (result === "downloaded") toast("Achievement card saved to your device");
      else if (result === "shared") toast("Shared!");
    } catch {
      toast.error("Couldn't generate share card");
    }
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="achievement-detail">
        <DialogHeader>
          <DialogTitle className="sr-only">{def.title}</DialogTitle>
          <DialogDescription className="sr-only">{def.description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center text-center">
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
              r.chip,
            )}
          >
            {r.label}
          </span>
          <div
            className={cn(
              "mt-4 grid size-32 place-items-center rounded-3xl border bg-card/60 p-2",
              r.border,
              r.glow,
            )}
          >
            {unlocked ? (
              <PixelBadge rarity={def.rarity} size={112} icon={ICON_FOR[def.category]} />
            ) : (
              <div className="relative flex items-center justify-center">
                <PixelBadge
                  rarity={def.rarity}
                  size={112}
                  icon={ICON_FOR[def.category]}
                  className="opacity-25 grayscale"
                />
                <Lock className="absolute size-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">{def.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{def.description}</p>

          <div className="mt-4 grid w-full grid-cols-2 gap-2 text-left">
            <Field label="Category" value={def.category} />
            <Field label="Reward" value={`+${r.score} prestige`} />
            <Field
              label="Status"
              value={unlocked ? "Unlocked" : "Locked"}
              valueClass={unlocked ? r.text : "text-muted-foreground"}
            />
            <Field
              label={unlocked ? "Unlocked on" : "Target"}
              value={
                unlocked
                  ? new Date(unlockedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : `${def.threshold.toLocaleString()}`
              }
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            onClick={onShare}
            disabled={!unlocked}
            data-testid="share-achievement"
            className="w-full"
          >
            <Share2 className="size-4" />
            {unlocked ? "Share achievement" : "Locked — keep going!"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GoalTrophyDialog({
  goal,
  onOpenChange,
}: {
  goal: Goal | null;
  onOpenChange: (o: boolean) => void;
}) {
  if (!goal) {
    return (
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }
  const rarity: AchievementRarity =
    goal.difficulty === "hard" ? "epic" : goal.difficulty === "medium" ? "rare" : "common";
  const r = RARITY_STYLE[rarity];

  const onShare = async () => {
    try {
      const chips: string[] = [];
      if (goal.rewardCoins > 0) chips.push(`+${goal.rewardCoins} coins`);
      if (goal.rewardXp > 0) chips.push(`+${goal.rewardXp} XP`);
      const result = await shareCard({
        title: goal.title,
        subtitle: `Goal completed · ${goal.difficulty} difficulty`,
        rarity,
        chips,
        footer: goal.completedAt
          ? `Completed ${new Date(goal.completedAt).toLocaleDateString()}`
          : undefined,
      });
      if (result === "downloaded") toast("Trophy card saved to your device");
      else if (result === "shared") toast("Shared!");
    } catch {
      toast.error("Couldn't generate share card");
    }
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="goal-trophy-detail">
        <DialogHeader>
          <DialogTitle className="sr-only">{goal.title}</DialogTitle>
          <DialogDescription className="sr-only">Completed goal trophy</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center text-center">
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
              r.chip,
            )}
          >
            {r.label} TROPHY
          </span>
          <div
            className={cn(
              "mt-4 grid size-32 place-items-center rounded-3xl border bg-card/60",
              r.border,
              r.glow,
            )}
          >
            <PixelTrophy rarity={rarity} size={112} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">{goal.title}</h2>
          {goal.description && (
            <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>
          )}

          <div className="mt-4 grid w-full grid-cols-2 gap-2 text-left">
            <Field label="Category" value={goal.category} />
            <Field label="Difficulty" value={goal.difficulty} />
            <Field
              label="Coins"
              value={`+${goal.rewardCoins}`}
              icon={<Coins className="size-3 text-amber-400" />}
            />
            <Field
              label="Pet XP"
              value={`+${goal.rewardXp}`}
              icon={<Zap className="size-3 text-fuchsia-400" />}
            />
            <Field
              label="Completed"
              value={
                goal.completedAt
                  ? new Date(goal.completedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"
              }
            />
            <Field
              label="Type"
              value={goal.goalType === "simple" ? "One-tap" : "Progress"}
              icon={<ListChecks className="size-3 text-muted-foreground" />}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button onClick={onShare} className="w-full" data-testid="share-trophy">
            <Share2 className="size-4" />
            Share trophy card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  valueClass,
  icon,
}: {
  label: string;
  value: string;
  valueClass?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={cn("mt-0.5 text-sm font-semibold capitalize text-foreground", valueClass)}>
        {value}
      </div>
    </div>
  );
}

export const _unused = Trophy;
