import { supabase } from "./supabase";

export type GoalStatus = "active" | "completed" | "archived";
export type GoalType = "simple" | "quantitative";
export type GoalDifficulty = "easy" | "medium" | "hard" | "custom";

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: string;
  icon: string;
  color: string;
  goalType: GoalType;
  difficulty: GoalDifficulty;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string | null;
  rewardCoins: number;
  rewardXp: number;
  rewardItem: string | null;
  status: GoalStatus;
  completedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type GoalInput = {
  title: string;
  description?: string | null;
  category?: string;
  icon?: string;
  color?: string;
  goalType: GoalType;
  difficulty: GoalDifficulty;
  targetValue: number;
  unit: string;
  deadline?: string | null;
  rewardCoins: number;
  rewardXp: number;
  rewardItem?: string | null;
};

export const GOAL_CATEGORIES = [
  "health",
  "fitness",
  "learning",
  "productivity",
  "mindfulness",
  "finance",
  "creativity",
  "general",
] as const;

export const GOAL_ICONS = [
  "Target",
  "Trophy",
  "Flame",
  "Star",
  "Award",
  "Dumbbell",
  "BookOpen",
  "GraduationCap",
  "Brain",
  "Heart",
  "DollarSign",
  "Zap",
  "Sun",
  "Moon",
] as const;

export const GOAL_COLORS = ["primary", "accent", "success", "warn", "danger"] as const;

export const DIFFICULTY_PRESETS: Record<
  Exclude<GoalDifficulty, "custom">,
  { coins: number; xp: number; label: string; color: string }
> = {
  easy: { coins: 25, xp: 10, label: "Easy", color: "success" },
  medium: { coins: 75, xp: 30, label: "Medium", color: "primary" },
  hard: { coins: 200, xp: 80, label: "Hard", color: "danger" },
};

function rowToGoal(r: Record<string, unknown>): Goal {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    title: r.title as string,
    description: (r.description as string | null) ?? null,
    category: r.category as string,
    icon: r.icon as string,
    color: r.color as string,
    goalType: (r.goal_type as GoalType) ?? "quantitative",
    difficulty: (r.difficulty as GoalDifficulty) ?? "custom",
    targetValue: Number(r.target_value),
    currentValue: Number(r.current_value),
    unit: r.unit as string,
    deadline: (r.deadline as string | null) ?? null,
    rewardCoins: (r.reward_coins as number) ?? 0,
    rewardXp: (r.xp_reward as number) ?? 0,
    rewardItem: (r.reward_item as string | null) ?? null,
    status: r.status as GoalStatus,
    completedAt: (r.completed_at as string | null) ?? null,
    sortOrder: (r.sort_order as number) ?? 0,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export async function fetchGoals(userId: string): Promise<Goal[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchGoals", error);
    return [];
  }
  return (data ?? []).map(rowToGoal);
}

export async function createGoal(userId: string, input: GoalInput): Promise<Goal | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("user_goals")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description ?? null,
      category: input.category ?? "general",
      icon: input.icon ?? "Target",
      color: input.color ?? "primary",
      goal_type: input.goalType,
      difficulty: input.difficulty,
      target_value: input.goalType === "simple" ? 1 : input.targetValue,
      current_value: 0,
      unit: input.goalType === "simple" ? "done" : input.unit,
      deadline: input.deadline ?? null,
      reward_coins: input.rewardCoins,
      xp_reward: input.rewardXp,
      reward_item: input.rewardItem ?? null,
      status: "active",
    })
    .select("*")
    .single();
  if (error) {
    console.error("createGoal", error);
    return null;
  }
  return rowToGoal(data);
}

export async function updateGoal(
  goalId: string,
  patch: Partial<
    GoalInput & {
      currentValue: number;
      status: GoalStatus;
      completedAt: string | null;
    }
  >,
): Promise<boolean> {
  if (!supabase) return false;
  const dbPatch: Record<string, unknown> = {};
  if (patch.title !== undefined) dbPatch.title = patch.title;
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.category !== undefined) dbPatch.category = patch.category;
  if (patch.icon !== undefined) dbPatch.icon = patch.icon;
  if (patch.color !== undefined) dbPatch.color = patch.color;
  if (patch.goalType !== undefined) dbPatch.goal_type = patch.goalType;
  if (patch.difficulty !== undefined) dbPatch.difficulty = patch.difficulty;
  if (patch.targetValue !== undefined) dbPatch.target_value = patch.targetValue;
  if (patch.currentValue !== undefined) dbPatch.current_value = patch.currentValue;
  if (patch.unit !== undefined) dbPatch.unit = patch.unit;
  if (patch.deadline !== undefined) dbPatch.deadline = patch.deadline;
  if (patch.rewardCoins !== undefined) dbPatch.reward_coins = patch.rewardCoins;
  if (patch.rewardXp !== undefined) dbPatch.xp_reward = patch.rewardXp;
  if (patch.rewardItem !== undefined) dbPatch.reward_item = patch.rewardItem;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.completedAt !== undefined) dbPatch.completed_at = patch.completedAt;
  const { error } = await supabase.from("user_goals").update(dbPatch).eq("id", goalId);
  if (error) {
    console.error("updateGoal", error);
    return false;
  }
  return true;
}

export async function deleteGoal(goalId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("user_goals").delete().eq("id", goalId);
  if (error) {
    console.error("deleteGoal", error);
    return false;
  }
  return true;
}

export function goalProgress(g: Goal): number {
  if (g.targetValue <= 0) return 0;
  return Math.min(1, g.currentValue / g.targetValue);
}

export function isGoalComplete(g: Goal): boolean {
  if (g.goalType === "simple") return true;
  return g.currentValue >= g.targetValue;
}

export function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null;
  const d = new Date(deadline + "T00:00:00").getTime();
  const now = Date.now();
  return Math.ceil((d - now) / 86_400_000);
}
