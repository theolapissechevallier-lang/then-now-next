import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Activity,
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
} from "lucide-react";
import { useHabits } from "@/lib/habit-store";
import {
  type Habit,
  type HabitIcon,
  ICON_OPTIONS,
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  DIFFICULTY_OPTIONS,
  UNIT_OPTIONS,
} from "@/lib/habits";
import { ScreenHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/habits")({
  head: () => ({ meta: [{ title: "Manage Habits — Future Me" }] }),
  component: HabitsPage,
});

// Icon mapping
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

function HabitsPage() {
  const { habits, loading, createHabit, updateHabit, deleteHabit, reorderHabits } = useHabits();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDelete = async (habitId: string) => {
    const success = await deleteHabit(habitId);
    if (success) {
      toast.success("Habit deleted");
    } else {
      toast.error("Failed to delete habit");
    }
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const handleDrop = async (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }

    const newOrder = [...habits];
    const [dragged] = newOrder.splice(dragIndex, 1);
    newOrder.splice(targetIndex, 0, dragged);

    const habitIds = newOrder.map((h) => h.id);
    await reorderHabits(habitIds);
    setDragIndex(null);
  };

  return (
    <div>
      <ScreenHeader
        eyebrow="Habits"
        title="Customize your tracking"
        subtitle="Create, edit, and organize the habits you want to track daily."
      />

      <section className="mt-6 px-5 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Activity className="size-6 animate-pulse text-muted-foreground" />
          </div>
        ) : habits.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No habits yet. Create your first one!</p>
          </div>
        ) : (
          habits.map((habit, index) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              index={index}
              onEdit={() => {
                setEditingHabit(habit);
                setEditDialogOpen(true);
              }}
              onDelete={() => handleDelete(habit.id)}
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onDrop={() => handleDrop(index)}
              isDragging={dragIndex === index}
            />
          ))
        )}
      </section>

      <div className="mt-6 px-5">
        <Button
          onClick={() => {
            setEditingHabit(null);
            setEditDialogOpen(true);
          }}
          className="h-12 w-full rounded-2xl"
        >
          <Plus className="mr-2 size-4" />
          Add new habit
        </Button>
      </div>

      <HabitEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        habit={editingHabit}
        onSave={async (habitData) => {
          if (editingHabit) {
            await updateHabit(editingHabit.id, habitData);
            toast.success("Habit updated");
          } else {
            const created = await createHabit(habitData);
            if (created) {
              toast.success("Habit created");
            } else {
              toast.error("Failed to create habit");
            }
          }
          setEditDialogOpen(false);
        }}
      />

      <div className="mt-6 px-5">
        <Button asChild variant="secondary" className="w-full">
          <Link to="/track">Back to tracking</Link>
        </Button>
      </div>
    </div>
  );
}

function HabitCard({
  habit,
  index,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragging,
}: {
  habit: Habit;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  isDragging: boolean;
}) {
  const Icon = ICON_COMPONENTS[habit.icon] || Activity;
  const colorClass =
    habit.color === "primary"
      ? "text-primary"
      : habit.color === "accent"
        ? "text-accent"
        : habit.color === "success"
          ? "text-success"
          : habit.color === "warn"
            ? "text-warn"
            : "text-danger";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={cn(
        "flex items-center gap-3 rounded-2xl border bg-card p-4 transition-all",
        isDragging ? "opacity-50 scale-[0.98]" : "opacity-100",
        "cursor-grab active:cursor-grabbing",
      )}
    >
      <GripVertical className="size-5 shrink-0 text-muted-foreground" />

      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl bg-secondary",
          colorClass,
        )}
      >
        <Icon className="size-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-semibold truncate">{habit.name}</p>
        <p className="text-xs text-muted-foreground">
          {DIFFICULTY_OPTIONS.find((d) => d.value === habit.difficulty)?.label} ·{" "}
          {habit.rewardPerUnit > 0
            ? `${habit.rewardPerUnit} coin${habit.rewardPerUnit > 1 ? "s" : ""}`
            : "Tracking only"}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onEdit}
          className="grid size-8 place-items-center rounded-lg hover:bg-secondary"
        >
          <Pencil className="size-4 text-muted-foreground" />
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="grid size-8 place-items-center rounded-lg hover:bg-danger/10">
              <Trash2 className="size-4 text-muted-foreground hover:text-danger" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{habit.name}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove this habit and all its history. Your coins won't be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function HabitEditDialog({
  open,
  onOpenChange,
  habit,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit | null;
  onSave: (habit: Omit<Habit, "id" | "userId">) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<HabitIcon>("Activity");
  const [category, setCategory] = useState<Habit["category"]>("general");
  const [color, setColor] = useState<Habit["color"]>("primary");
  const [difficulty, setDifficulty] = useState<Habit["difficulty"]>("medium");
  const [unit, setUnit] = useState("minutes");
  const [rewardPerUnit, setRewardPerUnit] = useState(1);
  const [xpPerUnit, setXpPerUnit] = useState(1);
  const [targetPerDay, setTargetPerDay] = useState(30);
  const [saving, setSaving] = useState(false);

  // Reset form when dialog opens
  const [initialized, setInitialized] = useState(false);

  if (open && !initialized) {
    if (habit) {
      setName(habit.name);
      setIcon(habit.icon);
      setCategory(habit.category);
      setColor(habit.color);
      setDifficulty(habit.difficulty);
      setUnit(habit.unit);
      setRewardPerUnit(habit.rewardPerUnit);
      setXpPerUnit(habit.xpPerUnit);
      setTargetPerDay(habit.targetPerDay);
    } else {
      setName("");
      setIcon("Activity");
      setCategory("general");
      setColor("primary");
      setDifficulty("medium");
      setUnit("minutes");
      setRewardPerUnit(1);
      setXpPerUnit(1);
      setTargetPerDay(30);
    }
    setInitialized(true);
  }

  if (!open && initialized) {
    setInitialized(false);
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a habit name");
      return;
    }

    setSaving(true);
    await onSave({
      name: name.trim(),
      icon,
      category,
      color,
      difficulty,
      unit,
      rewardPerUnit,
      xpPerUnit,
      targetPerDay,
      isActive: true,
      sortOrder: 0,
      isDefault: false,
    });
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{habit ? "Edit habit" : "Create new habit"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Habit name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning meditation"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto">
              {ICON_OPTIONS.map((opt) => {
                const IconComp = ICON_COMPONENTS[opt.value];
                return (
                  <button
                    key={opt.value}
                    onClick={() => setIcon(opt.value)}
                    className={cn(
                      "grid size-10 place-items-center rounded-lg border transition-colors",
                      icon === opt.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <IconComp className="size-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCategory(opt.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    category === opt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setColor(opt.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    color === opt.value
                      ? `border-${opt.value} bg-${opt.value}/10 text-${opt.value}`
                      : "border-border hover:border-primary/40",
                  )}
                  style={
                    color === opt.value
                      ? {
                          borderColor: `var(--color-${opt.value})`,
                          backgroundColor: `oklch(from var(--color-${opt.value}) l c h / 0.1)`,
                          color: `var(--color-${opt.value})`,
                        }
                      : undefined
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Difficulty</Label>
            <div className="flex gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDifficulty(opt.value)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    difficulty === opt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Unit</Label>
            <div className="flex flex-wrap gap-2">
              {UNIT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setUnit(opt.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    unit === opt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Coins per unit: {rewardPerUnit}</Label>
            <Slider
              value={[rewardPerUnit]}
              min={0}
              max={10}
              step={1}
              onValueChange={(v) => setRewardPerUnit(v[0] ?? 0)}
              data-testid="habit-coins-slider"
            />
            <p className="text-xs text-muted-foreground">
              Set to 0 for tracking-only habits (like screen time)
            </p>
          </div>

          <div className="space-y-2">
            <Label>XP per unit: {xpPerUnit}</Label>
            <Slider
              value={[xpPerUnit]}
              min={0}
              max={10}
              step={1}
              onValueChange={(v) => setXpPerUnit(v[0] ?? 0)}
              data-testid="habit-xp-slider"
            />
            <p className="text-xs text-muted-foreground">
              XP feeds your pet AND your personal level. Set to 0 to skip XP.
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              Daily target: {targetPerDay} {unit}
            </Label>
            <Slider
              value={[targetPerDay]}
              min={5}
              max={unit === "hours" ? 12 : unit === "minutes" ? 120 : 100}
              step={unit === "minutes" ? 5 : 1}
              onValueChange={(v) => setTargetPerDay(v[0] ?? 30)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : habit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
