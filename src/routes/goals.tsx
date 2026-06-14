import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  Target,
  Trophy,
  Flame,
  Star,
  Award,
  Dumbbell,
  BookOpen,
  GraduationCap,
  Brain,
  Heart,
  DollarSign,
  Zap,
  Sun,
  Moon,
  Plus,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  Check,
  Calendar,
  Coins,
  Sparkles,
  CalendarCheck,
  Clock,
  Gift,
  CheckCircle2,
  ListChecks,
  Share2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useGoals } from "@/lib/goals-store";
import { useAppState } from "@/lib/store";
import { shareCard } from "@/lib/share-card";
import type { AchievementRarity } from "@/lib/achievements";
import {
  DIFFICULTY_PRESETS,
  daysUntil,
  goalProgress,
  isGoalComplete,
  type Goal,
  type GoalDifficulty,
  type GoalInput,
  type GoalType,
} from "@/lib/goals";

export const Route = createFileRoute("/goals")({
  component: GoalsScreen,
});

const ICONS: Record<string, LucideIcon> = {
  Target,
  Trophy,
  Flame,
  Star,
  Award,
  Dumbbell,
  BookOpen,
  GraduationCap,
  Brain,
  Heart,
  DollarSign,
  Zap,
  Sun,
  Moon,
};

const COLOR_CLASSES: Record<string, string> = {
  primary: "bg-primary/15 text-primary",
  accent: "bg-accent/15 text-accent",
  success: "bg-emerald-500/15 text-emerald-400",
  warn: "bg-amber-500/15 text-amber-400",
  danger: "bg-red-500/15 text-red-400",
};

const DIFFICULTY_BADGE: Record<GoalDifficulty, string> = {
  easy: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  medium: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  hard: "bg-rose-500/15 text-rose-300 border-rose-400/30",
  custom: "bg-secondary text-muted-foreground border-border",
};

function GoalsScreen() {
  const { user } = useAuth();
  const { goals, loading, deleteGoal, completeGoal, archiveGoal, restoreGoal, setProgress } =
    useGoals();
  const { addCoins, addPetXp } = useAppState();
  const [tab, setTab] = useState<"active" | "completed" | "archived">("active");
  const [editing, setEditing] = useState<Goal | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const tabbed = useMemo(() => goals.filter((g) => g.status === tab), [goals, tab]);

  if (!user) {
    return (
      <div className="px-5 pt-12">
        <ScreenHeader
          eyebrow="Goals"
          title="Sign in to set goals"
          subtitle="Your goals sync to your account so you never lose progress."
        />
      </div>
    );
  }

  const handleComplete = async (g: Goal) => {
    const { ok, coins, xp } = await completeGoal(g.id);
    if (ok) {
      if (coins > 0) await addCoins(coins);
      if (xp > 0) await addPetXp(xp);
      const parts: string[] = [];
      if (coins > 0) parts.push(`+${coins} coins`);
      if (xp > 0) parts.push(`+${xp} XP`);
      toast.success(`Goal completed!${parts.length ? ` ${parts.join(" · ")}` : ""}`);
    } else {
      toast.error("Couldn't complete goal");
    }
  };

  return (
    <div className="pb-10" data-testid="goals-screen">
      <ScreenHeader
        eyebrow="Goals"
        title="What are you building?"
        subtitle="Set targets, track progress, claim rewards."
      />

      <div className="px-5 pt-6">
        <Button
          onClick={() => setCreating(true)}
          className="w-full"
          size="lg"
          data-testid="new-goal-button"
        >
          <Plus className="size-4" />
          New goal
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-6">
        <div className="px-5">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" data-testid="tab-active">
              Active
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">
              Completed
            </TabsTrigger>
            <TabsTrigger value="archived" data-testid="tab-archived">
              Archived
            </TabsTrigger>
          </TabsList>
        </div>

        {(["active", "completed", "archived"] as const).map((s) => (
          <TabsContent key={s} value={s} className="mt-4 space-y-3 px-5">
            {loading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
            ) : s === "completed" ? (
              <CompletedShowcase
                goals={tabbed}
                onArchive={(id) => archiveGoal(id).then((ok) => ok && toast("Moved to archive"))}
              />
            ) : tabbed.length === 0 ? (
              <EmptyState status={s} />
            ) : (
              tabbed.map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  onEdit={() => setEditing(g)}
                  onDelete={() => setDeleteId(g.id)}
                  onComplete={() => handleComplete(g)}
                  onArchive={() => archiveGoal(g.id).then((ok) => ok && toast("Goal archived"))}
                  onRestore={() => restoreGoal(g.id).then((ok) => ok && toast("Goal restored"))}
                  onProgress={(v) => setProgress(g.id, v)}
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      <GoalDialog open={creating} onOpenChange={setCreating} goal={null} />
      <GoalDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} goal={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent data-testid="delete-goal-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the goal and its progress. Completed achievements aren't
              affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="delete-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="delete-confirm"
              onClick={async () => {
                if (!deleteId) return;
                const ok = await deleteGoal(deleteId);
                setDeleteId(null);
                if (ok) toast("Goal deleted");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmptyState({ status }: { status: "active" | "completed" | "archived" }) {
  const copy =
    status === "active"
      ? "No active goals yet. Create one to start building your future."
      : status === "completed"
        ? "Complete a goal to celebrate your wins here."
        : "Archived goals will appear here.";
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
      <Target className="mx-auto size-8 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">{copy}</p>
    </div>
  );
}

function GoalCard({
  goal,
  onEdit,
  onDelete,
  onComplete,
  onArchive,
  onRestore,
  onProgress,
}: {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onProgress: (v: number) => void;
}) {
  const Icon = ICONS[goal.icon] ?? Target;
  const isSimple = goal.goalType === "simple";
  const pct = Math.round(goalProgress(goal) * 100);
  const days = daysUntil(goal.deadline);
  const reachable = isGoalComplete(goal);
  const [val, setVal] = useState(String(goal.currentValue));

  return (
    <div
      className="rounded-2xl border border-border bg-card/70 p-4 shadow-soft"
      data-testid={`goal-card-${goal.id}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid size-10 place-items-center rounded-xl",
            COLOR_CLASSES[goal.color] ?? COLOR_CLASSES.primary,
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground">{goal.title}</h3>
          {goal.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{goal.description}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          {goal.status === "active" && (
            <button
              onClick={onEdit}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Edit goal"
              data-testid={`edit-goal-${goal.id}`}
            >
              <Pencil className="size-4" />
            </button>
          )}
          {goal.status !== "completed" && (
            <button
              onClick={onDelete}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
              aria-label="Delete goal"
              data-testid={`delete-goal-${goal.id}`}
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Type + difficulty tags */}
      <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-muted-foreground">
          {isSimple ? <CheckCircle2 className="size-3" /> : <ListChecks className="size-3" />}
          {isSimple ? "Simple" : "Progress"}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5",
            DIFFICULTY_BADGE[goal.difficulty],
          )}
        >
          {goal.difficulty}
        </span>
      </div>

      {!isSimple && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {goal.currentValue} / {goal.targetValue} {goal.unit}
            </span>
            <span>{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
        {days !== null && goal.status === "active" && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1",
              days < 0 && "bg-red-500/15 text-red-400",
            )}
          >
            <Calendar className="size-3" />
            {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today" : `${days}d left`}
          </span>
        )}
        {goal.rewardXp > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/15 px-2 py-1 text-fuchsia-300">
            <Zap className="size-3" />
            {goal.rewardXp} XP
          </span>
        )}
        {goal.rewardCoins > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-amber-300">
            <Coins className="size-3" />
            {goal.rewardCoins} coins
          </span>
        )}
        {goal.rewardItem && (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
            <Gift className="size-3" /> {goal.rewardItem}
          </span>
        )}
      </div>

      {goal.status === "active" && (
        <div className="mt-4 space-y-2">
          {!isSimple && (
            <div className="flex gap-2">
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className="h-9"
                data-testid={`progress-input-${goal.id}`}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onProgress(Number(val) || 0)}
                data-testid={`progress-update-${goal.id}`}
              >
                Update
              </Button>
            </div>
          )}
          <Button
            onClick={onComplete}
            disabled={!reachable}
            className="w-full"
            size="sm"
            data-testid={`complete-goal-${goal.id}`}
          >
            <Check className="size-4" />
            {isSimple
              ? "Mark complete & claim reward"
              : reachable
                ? "Validate & claim reward"
                : `Reach ${goal.targetValue} ${goal.unit} to claim`}
          </Button>
          <Button variant="ghost" size="sm" className="w-full" onClick={onArchive}>
            <Archive className="size-4" />
            Archive
          </Button>
        </div>
      )}

      {goal.status === "completed" && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
          <span className="inline-flex items-center gap-1.5">
            <Trophy className="size-4" /> Completed
          </span>
          <Button variant="ghost" size="sm" onClick={onArchive}>
            <Archive className="size-4" />
            Archive
          </Button>
        </div>
      )}

      {goal.status === "archived" && (
        <div className="mt-4">
          <Button variant="ghost" size="sm" className="w-full" onClick={onRestore}>
            <ArchiveRestore className="size-4" />
            Restore to active
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------- Goal dialog ----------------

function GoalDialog({
  open,
  onOpenChange,
  goal,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  goal: Goal | null;
}) {
  const { createGoal, updateGoal } = useGoals();
  const [form, setForm] = useState<GoalInput>(() => initialForm(goal));
  const [initialKey, setInitialKey] = useState<string>(goal?.id ?? "new");
  const [saving, setSaving] = useState(false);

  const expectedKey = goal?.id ?? "new";
  if (open && initialKey !== expectedKey) {
    setForm(initialForm(goal));
    setInitialKey(expectedKey);
  }

  const setType = (t: GoalType) => {
    setForm((f) => ({
      ...f,
      goalType: t,
      // sensible defaults if switching to quantitative
      targetValue: t === "simple" ? 1 : f.targetValue > 0 ? f.targetValue : 10,
      unit: t === "simple" ? "done" : f.unit && f.unit !== "done" ? f.unit : "times",
    }));
  };

  const setDifficulty = (d: GoalDifficulty) => {
    setForm((f) => {
      if (d === "custom") return { ...f, difficulty: d };
      const preset = DIFFICULTY_PRESETS[d];
      return { ...f, difficulty: d, rewardCoins: preset.coins, rewardXp: preset.xp };
    });
  };

  const submit = async () => {
    if (!form.title.trim()) {
      toast.error("Add a title");
      return;
    }
    if (form.goalType === "quantitative" && (!form.targetValue || form.targetValue <= 0)) {
      toast.error("Target must be greater than 0");
      return;
    }
    if (form.rewardCoins < 0 || form.rewardXp < 0) {
      toast.error("Rewards can't be negative");
      return;
    }
    setSaving(true);
    const ok = goal ? await updateGoal(goal.id, form) : !!(await createGoal(form));
    setSaving(false);
    if (ok) {
      toast.success(goal ? "Goal updated" : "Goal created");
      onOpenChange(false);
      setInitialKey("");
    } else {
      toast.error("Couldn't save goal");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="goal-dialog">
        <DialogHeader>
          <DialogTitle>{goal ? "Edit goal" : "New goal"}</DialogTitle>
          <DialogDescription>
            Define what you want to achieve and how you'll be rewarded.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-title">Title</Label>
            <Input
              id="goal-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Run a half marathon"
              data-testid="goal-title-input"
            />
          </div>

          {/* Goal type */}
          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <TypeChip
                active={form.goalType === "simple"}
                icon={<CheckCircle2 className="size-4" />}
                title="Simple"
                hint="One-click validate"
                onClick={() => setType("simple")}
                testId="type-simple"
              />
              <TypeChip
                active={form.goalType === "quantitative"}
                icon={<ListChecks className="size-4" />}
                title="Progress"
                hint="Track to a target"
                onClick={() => setType("quantitative")}
                testId="type-quantitative"
              />
            </div>
          </div>

          {/* Target / unit (only quantitative) */}
          {form.goalType === "quantitative" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="goal-target">Target value</Label>
                <Input
                  id="goal-target"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={form.targetValue || ""}
                  onChange={(e) => setForm({ ...form, targetValue: Number(e.target.value) })}
                  data-testid="goal-target-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal-unit">Unit</Label>
                <Input
                  id="goal-unit"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="km, books, hours"
                  data-testid="goal-unit-input"
                />
              </div>
            </div>
          )}

          {/* Difficulty */}
          <div className="space-y-1.5">
            <Label>Difficulty</Label>
            <div className="grid grid-cols-4 gap-2">
              {(["easy", "medium", "hard", "custom"] as const).map((d) => (
                <DifficultyChip
                  key={d}
                  active={form.difficulty === d}
                  difficulty={d}
                  onClick={() => setDifficulty(d)}
                  testId={`difficulty-${d}`}
                />
              ))}
            </div>
            {form.difficulty !== "custom" && (
              <p className="text-[11px] text-muted-foreground">
                Auto-fills{" "}
                {DIFFICULTY_PRESETS[form.difficulty as Exclude<GoalDifficulty, "custom">].coins}{" "}
                coins ·{" "}
                {DIFFICULTY_PRESETS[form.difficulty as Exclude<GoalDifficulty, "custom">].xp} XP.
                Tweak below to override.
              </p>
            )}
          </div>

          {/* Rewards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-coins" className="inline-flex items-center gap-1.5">
                <Coins className="size-3.5 text-amber-400" /> Coin reward
              </Label>
              <Input
                id="goal-coins"
                type="number"
                min={0}
                value={form.rewardCoins || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rewardCoins: Number(e.target.value),
                    difficulty: "custom",
                  })
                }
                data-testid="goal-coins-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-xp" className="inline-flex items-center gap-1.5">
                <Zap className="size-3.5 text-fuchsia-400" /> Pet XP reward
              </Label>
              <Input
                id="goal-xp"
                type="number"
                min={0}
                value={form.rewardXp || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rewardXp: Number(e.target.value),
                    difficulty: "custom",
                  })
                }
                data-testid="goal-xp-input"
              />
            </div>
          </div>

          {/* Optional notes */}
          <details className="rounded-xl border border-border bg-card/40 p-3 text-sm">
            <summary className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Optional details
            </summary>
            <div className="mt-3 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="goal-desc">Description</Label>
                <Textarea
                  id="goal-desc"
                  value={form.description ?? ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Why does this matter to you?"
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal-deadline">Deadline</Label>
                <Input
                  id="goal-deadline"
                  type="date"
                  value={form.deadline ?? ""}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value || null })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal-bonus">Bonus reward</Label>
                <Input
                  id="goal-bonus"
                  value={form.rewardItem ?? ""}
                  onChange={(e) => setForm({ ...form, rewardItem: e.target.value || null })}
                  placeholder="Movie night, new shoes…"
                />
              </div>
            </div>
          </details>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            data-testid="goal-dialog-cancel"
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving} data-testid="goal-dialog-save">
            {saving ? "Saving…" : goal ? "Save changes" : "Create goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TypeChip({
  active,
  icon,
  title,
  hint,
  onClick,
  testId,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  hint: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={cn(
        "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition",
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-card/40 text-muted-foreground hover:bg-secondary",
      )}
    >
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon} {title}
      </span>
      <span className="text-[11px]">{hint}</span>
    </button>
  );
}

function DifficultyChip({
  active,
  difficulty,
  onClick,
  testId,
}: {
  active: boolean;
  difficulty: GoalDifficulty;
  onClick: () => void;
  testId: string;
}) {
  const label = difficulty === "custom" ? "Custom" : DIFFICULTY_PRESETS[difficulty].label;
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={cn(
        "rounded-lg border px-2 py-2 text-xs font-semibold capitalize transition",
        active
          ? cn("border-transparent", DIFFICULTY_BADGE[difficulty], "ring-1 ring-current/30")
          : "border-border bg-card/40 text-muted-foreground hover:bg-secondary",
      )}
    >
      {label}
    </button>
  );
}

function initialForm(g: Goal | null): GoalInput {
  if (!g) {
    return {
      title: "",
      description: "",
      category: "general",
      icon: "Target",
      color: "primary",
      goalType: "quantitative",
      difficulty: "medium",
      targetValue: 10,
      unit: "times",
      deadline: null,
      rewardCoins: DIFFICULTY_PRESETS.medium.coins,
      rewardXp: DIFFICULTY_PRESETS.medium.xp,
      rewardItem: "",
    };
  }
  return {
    title: g.title,
    description: g.description ?? "",
    category: g.category,
    icon: g.icon,
    color: g.color,
    goalType: g.goalType,
    difficulty: g.difficulty,
    targetValue: g.targetValue,
    unit: g.unit,
    deadline: g.deadline,
    rewardCoins: g.rewardCoins,
    rewardXp: g.rewardXp,
    rewardItem: g.rewardItem ?? "",
  };
}

// ---------------- Completed showcase ----------------

type Rarity = { label: string; ring: string; chip: string; glow: string };

function rarityFor(g: Goal): Rarity {
  const score = g.targetValue * 1 + g.rewardCoins * 0.5 + g.rewardXp * 1 + (g.deadline ? 20 : 0);
  if (score >= 400)
    return {
      label: "Legendary",
      ring: "ring-amber-400/60",
      chip: "bg-amber-500/20 text-amber-300 border-amber-400/40",
      glow: "shadow-[0_0_30px_-8px_rgba(251,191,36,0.55)]",
    };
  if (score >= 150)
    return {
      label: "Epic",
      ring: "ring-fuchsia-400/60",
      chip: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40",
      glow: "shadow-[0_0_25px_-10px_rgba(232,121,249,0.55)]",
    };
  if (score >= 60)
    return {
      label: "Rare",
      ring: "ring-sky-400/60",
      chip: "bg-sky-500/20 text-sky-300 border-sky-400/40",
      glow: "shadow-[0_0_22px_-12px_rgba(56,189,248,0.55)]",
    };
  return {
    label: "Common",
    ring: "ring-emerald-400/50",
    chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    glow: "",
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function daysBetween(a: string, b: string): number {
  const diff = Date.parse(b) - Date.parse(a);
  return Math.max(1, Math.round(diff / 86_400_000));
}

function CompletedShowcase({
  goals,
  onArchive,
}: {
  goals: Goal[];
  onArchive: (id: string) => void;
}) {
  const [open, setOpen] = useState<Goal | null>(null);

  const sorted = useMemo(
    () =>
      [...goals].sort(
        (a, b) =>
          Date.parse(b.completedAt ?? b.updatedAt) - Date.parse(a.completedAt ?? a.updatedAt),
      ),
    [goals],
  );

  const totalCoins = goals.reduce((s, g) => s + g.rewardCoins, 0);
  const totalXp = goals.reduce((s, g) => s + g.rewardXp, 0);
  const rareCount = goals.filter((g) => {
    const r = rarityFor(g).label;
    return r === "Epic" || r === "Legendary";
  }).length;

  if (goals.length === 0) {
    return <EmptyState status="completed" />;
  }

  return (
    <div className="space-y-5" data-testid="completed-showcase">
      {/* Stats banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-card/70 to-fuchsia-500/10 p-5">
        <Sparkles className="absolute -right-2 -top-2 size-20 text-amber-300/10" />
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
          <Trophy className="size-4" /> Achievement gallery
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3 text-center">
          <Stat value={goals.length} label="Unlocked" />
          <Stat value={totalCoins} label="Coins" />
          <Stat value={totalXp} label="XP" />
          <Stat value={rareCount} label="Rare+" />
        </div>
      </div>

      {/* Trophy grid */}
      <div className="grid grid-cols-2 gap-3">
        {sorted.map((g) => (
          <TrophyCard key={g.id} goal={g} onClick={() => setOpen(g)} />
        ))}
      </div>

      <AchievementDialog
        goal={open}
        onOpenChange={(o) => !o && setOpen(null)}
        onArchive={(id) => {
          onArchive(id);
          setOpen(null);
        }}
      />
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function TrophyCard({ goal, onClick }: { goal: Goal; onClick: () => void }) {
  const Icon = ICONS[goal.icon] ?? Trophy;
  const r = rarityFor(goal);
  return (
    <button
      onClick={onClick}
      data-testid={`trophy-${goal.id}`}
      className={cn(
        "group relative flex aspect-square flex-col items-center justify-between overflow-hidden rounded-2xl border border-border bg-card/70 p-3 text-center ring-1 transition-transform active:scale-[0.97]",
        r.ring,
        r.glow,
      )}
    >
      <span
        className={cn(
          "self-start rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
          r.chip,
        )}
      >
        {r.label}
      </span>

      <div className="relative">
        <div className="absolute inset-0 -m-3 rounded-full bg-gradient-to-b from-amber-300/15 to-transparent blur-md" />
        <div
          className={cn(
            "relative grid size-14 place-items-center rounded-full bg-gradient-to-b from-amber-200/90 to-amber-500/90 text-amber-950 shadow-inner",
          )}
        >
          <Icon className="size-7" strokeWidth={2.4} />
        </div>
      </div>

      <div className="w-full">
        <p className="line-clamp-2 text-xs font-semibold leading-tight text-foreground">
          {goal.title}
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground">{formatDate(goal.completedAt)}</p>
      </div>
    </button>
  );
}

function AchievementDialog({
  goal,
  onOpenChange,
  onArchive,
}: {
  goal: Goal | null;
  onOpenChange: (o: boolean) => void;
  onArchive: (id: string) => void;
}) {
  if (!goal) {
    return (
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }
  const Icon = ICONS[goal.icon] ?? Trophy;
  const r = rarityFor(goal);
  const days = goal.completedAt ? daysBetween(goal.createdAt, goal.completedAt) : null;
  const onTime =
    goal.deadline && goal.completedAt
      ? Date.parse(goal.completedAt) <= Date.parse(goal.deadline + "T23:59:59")
      : null;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="achievement-dialog">
        <DialogHeader>
          <DialogTitle className="sr-only">{goal.title}</DialogTitle>
          <DialogDescription className="sr-only">Achievement details</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center pt-2 text-center">
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
              r.chip,
            )}
          >
            {r.label} achievement
          </span>
          <div
            className={cn(
              "mt-4 grid size-24 place-items-center rounded-full bg-gradient-to-b from-amber-200 to-amber-500 text-amber-950 ring-4 shadow-[0_0_40px_-10px_rgba(251,191,36,0.6)]",
              r.ring,
            )}
          >
            <Icon className="size-12" strokeWidth={2.2} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">{goal.title}</h2>
          {goal.description && (
            <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>
          )}
        </div>

        {/* Rewards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border bg-card/60 p-3 text-center">
            <Coins className="mx-auto size-4 text-amber-400" />
            <div className="mt-1 text-lg font-bold text-foreground">{goal.rewardCoins}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">coins</div>
          </div>
          <div className="rounded-xl border border-border bg-card/60 p-3 text-center">
            <Zap className="mx-auto size-4 text-fuchsia-400" />
            <div className="mt-1 text-lg font-bold text-foreground">{goal.rewardXp}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">pet XP</div>
          </div>
          <div className="rounded-xl border border-border bg-card/60 p-3 text-center">
            <Gift className="mx-auto size-4 text-fuchsia-400" />
            <div className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">
              {goal.rewardItem || "—"}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">bonus</div>
          </div>
        </div>

        {/* Progress history */}
        <div className="rounded-2xl border border-border bg-card/40 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Clock className="size-3.5" /> Progress history
          </div>
          <ol className="mt-3 space-y-3">
            <TimelineRow
              icon={<Sparkles className="size-3.5" />}
              tone="muted"
              label="Started"
              value={formatDate(goal.createdAt)}
            />
            {goal.deadline && (
              <TimelineRow
                icon={<Calendar className="size-3.5" />}
                tone="muted"
                label="Deadline"
                value={formatDate(goal.deadline)}
              />
            )}
            <TimelineRow
              icon={<CalendarCheck className="size-3.5" />}
              tone="success"
              label="Completed"
              value={formatDate(goal.completedAt)}
            />
          </ol>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-secondary/50 p-2">
              <div className="text-sm font-semibold text-foreground">
                {goal.goalType === "simple"
                  ? "One-tap validated"
                  : `${goal.targetValue} ${goal.unit}`}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {goal.goalType === "simple" ? "type" : "target reached"}
              </div>
            </div>
            <div className="rounded-lg bg-secondary/50 p-2">
              <div className="text-sm font-semibold text-foreground">
                {days !== null ? `${days}d` : "—"}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {onTime === null ? "to complete" : onTime ? "on time" : "past deadline"}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="secondary"
            onClick={() => onArchive(goal.id)}
            data-testid="achievement-archive"
          >
            <Archive className="size-4" />
            Hide from gallery
          </Button>
          <Button
            onClick={async () => {
              try {
                const rarity: AchievementRarity =
                  goal.difficulty === "hard"
                    ? "epic"
                    : goal.difficulty === "medium"
                      ? "rare"
                      : "common";
                const chips: string[] = [];
                if (goal.rewardCoins > 0) chips.push(`+${goal.rewardCoins} coins`);
                if (goal.rewardXp > 0) chips.push(`+${goal.rewardXp} XP`);
                const res = await shareCard({
                  title: goal.title,
                  subtitle: `Goal completed · ${goal.difficulty} difficulty`,
                  rarity,
                  chips,
                  footer: goal.completedAt
                    ? `Completed ${new Date(goal.completedAt).toLocaleDateString()}`
                    : undefined,
                });
                if (res === "downloaded") toast("Trophy card saved");
                else if (res === "shared") toast("Shared!");
              } catch {
                toast.error("Couldn't generate share card");
              }
            }}
            data-testid="achievement-share"
          >
            <Share2 className="size-4" />
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TimelineRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: "muted" | "success";
}) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={cn(
          "grid size-7 place-items-center rounded-full",
          tone === "success"
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-secondary text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <div className="flex flex-1 items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold text-foreground">{value}</span>
      </div>
    </li>
  );
}
