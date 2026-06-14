import { supabase } from "./supabase";

export type AchievementCategory = "goals" | "streak" | "pet" | "habits" | "special";
export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  // Threshold for the criterion (used by evaluator)
  threshold: number;
  // Which metric to check
  metric:
    | "goals_completed"
    | "streak"
    | "pet_xp"
    | "pet_stage"
    | "habits_completed"
    | "coins_total";
}

export interface UnlockedAchievement {
  id: string;
  achievementId: string;
  unlockedAt: string;
  payload: Record<string, unknown> | null;
}

export interface UserStats {
  goalsCompleted: number;
  currentStreak: number;
  petXp: number;
  petStage: number; // 1..5
  habitsCompleted: number;
  coinsTotal: number;
}

export const RARITY_STYLE: Record<
  AchievementRarity,
  {
    label: string;
    border: string;
    chip: string;
    glow: string;
    text: string;
    score: number;
  }
> = {
  common: {
    label: "Common",
    border: "border-emerald-400/40",
    chip: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
    glow: "shadow-[0_0_18px_-8px_rgba(52,211,153,0.55)]",
    text: "text-emerald-300",
    score: 10,
  },
  rare: {
    label: "Rare",
    border: "border-sky-400/40",
    chip: "bg-sky-500/20 text-sky-200 border-sky-400/40",
    glow: "shadow-[0_0_22px_-8px_rgba(56,189,248,0.6)]",
    text: "text-sky-300",
    score: 25,
  },
  epic: {
    label: "Epic",
    border: "border-fuchsia-400/40",
    chip: "bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/40",
    glow: "shadow-[0_0_26px_-8px_rgba(232,121,249,0.65)]",
    text: "text-fuchsia-300",
    score: 75,
  },
  legendary: {
    label: "Legendary",
    border: "border-amber-400/50",
    chip: "bg-amber-500/25 text-amber-200 border-amber-400/50",
    glow: "shadow-[0_0_36px_-6px_rgba(251,191,36,0.75)]",
    text: "text-amber-300",
    score: 200,
  },
};

// All achievements available in the game. Order = display order.
export const ACHIEVEMENTS: AchievementDef[] = [
  // Goals
  {
    id: "goal_first",
    title: "First Step",
    description: "Complete your first goal",
    category: "goals",
    rarity: "common",
    metric: "goals_completed",
    threshold: 1,
  },
  {
    id: "goal_10",
    title: "Goal Crusher",
    description: "Complete 10 goals",
    category: "goals",
    rarity: "rare",
    metric: "goals_completed",
    threshold: 10,
  },
  {
    id: "goal_25",
    title: "Quarter Century",
    description: "Complete 25 goals",
    category: "goals",
    rarity: "rare",
    metric: "goals_completed",
    threshold: 25,
  },
  {
    id: "goal_50",
    title: "Half-Hundred Hero",
    description: "Complete 50 goals",
    category: "goals",
    rarity: "epic",
    metric: "goals_completed",
    threshold: 50,
  },
  {
    id: "goal_100",
    title: "Centurion",
    description: "Complete 100 goals",
    category: "goals",
    rarity: "legendary",
    metric: "goals_completed",
    threshold: 100,
  },
  // Streaks
  {
    id: "streak_3",
    title: "Building Momentum",
    description: "Reach a 3-day streak",
    category: "streak",
    rarity: "common",
    metric: "streak",
    threshold: 3,
  },
  {
    id: "streak_7",
    title: "One Week Warrior",
    description: "Reach a 7-day streak",
    category: "streak",
    rarity: "rare",
    metric: "streak",
    threshold: 7,
  },
  {
    id: "streak_30",
    title: "Habit Locked",
    description: "Reach a 30-day streak",
    category: "streak",
    rarity: "epic",
    metric: "streak",
    threshold: 30,
  },
  {
    id: "streak_100",
    title: "Triple-Digit Streak",
    description: "Reach a 100-day streak",
    category: "streak",
    rarity: "epic",
    metric: "streak",
    threshold: 100,
  },
  {
    id: "streak_365",
    title: "Year of You",
    description: "Reach a 365-day streak",
    category: "streak",
    rarity: "legendary",
    metric: "streak",
    threshold: 365,
  },
  // Pet
  {
    id: "pet_evolve_1",
    title: "First Evolution",
    description: "Evolve your pet for the first time",
    category: "pet",
    rarity: "common",
    metric: "pet_stage",
    threshold: 2,
  },
  {
    id: "pet_evolve_teen",
    title: "Teen Spirit",
    description: "Reach the Teen stage",
    category: "pet",
    rarity: "rare",
    metric: "pet_stage",
    threshold: 3,
  },
  {
    id: "pet_evolve_adult",
    title: "All Grown Up",
    description: "Reach the Adult stage",
    category: "pet",
    rarity: "epic",
    metric: "pet_stage",
    threshold: 4,
  },
  {
    id: "pet_evolve_master",
    title: "Pet Master",
    description: "Reach the Master stage",
    category: "pet",
    rarity: "legendary",
    metric: "pet_stage",
    threshold: 5,
  },
  {
    id: "pet_xp_500",
    title: "XP Hoarder",
    description: "Earn 500 pet XP total",
    category: "pet",
    rarity: "common",
    metric: "pet_xp",
    threshold: 500,
  },
  {
    id: "pet_xp_2500",
    title: "XP Tycoon",
    description: "Earn 2,500 pet XP total",
    category: "pet",
    rarity: "rare",
    metric: "pet_xp",
    threshold: 2500,
  },
  {
    id: "pet_xp_10000",
    title: "XP Legend",
    description: "Earn 10,000 pet XP total",
    category: "pet",
    rarity: "legendary",
    metric: "pet_xp",
    threshold: 10000,
  },
  // Habits
  {
    id: "habits_first",
    title: "First Check-In",
    description: "Log your first habit",
    category: "habits",
    rarity: "common",
    metric: "habits_completed",
    threshold: 1,
  },
  {
    id: "habits_50",
    title: "Habit Hatcher",
    description: "Log 50 habit completions",
    category: "habits",
    rarity: "rare",
    metric: "habits_completed",
    threshold: 50,
  },
  {
    id: "habits_100",
    title: "Routine Royalty",
    description: "Log 100 habit completions",
    category: "habits",
    rarity: "rare",
    metric: "habits_completed",
    threshold: 100,
  },
  {
    id: "habits_500",
    title: "Habit Machine",
    description: "Log 500 habit completions",
    category: "habits",
    rarity: "epic",
    metric: "habits_completed",
    threshold: 500,
  },
  {
    id: "habits_1000",
    title: "Master of Routine",
    description: "Log 1,000 habit completions",
    category: "habits",
    rarity: "legendary",
    metric: "habits_completed",
    threshold: 1000,
  },
  // Special / coins
  {
    id: "coins_100",
    title: "First 100",
    description: "Earn 100 total coins",
    category: "special",
    rarity: "common",
    metric: "coins_total",
    threshold: 100,
  },
  {
    id: "coins_1000",
    title: "Pocket Millionaire",
    description: "Earn 1,000 total coins",
    category: "special",
    rarity: "rare",
    metric: "coins_total",
    threshold: 1000,
  },
  {
    id: "coins_5000",
    title: "Coin Mogul",
    description: "Earn 5,000 total coins",
    category: "special",
    rarity: "epic",
    metric: "coins_total",
    threshold: 5000,
  },
];

export function evaluateAchievements(
  stats: UserStats,
  alreadyUnlocked: Set<string>,
): AchievementDef[] {
  const newly: AchievementDef[] = [];
  for (const a of ACHIEVEMENTS) {
    if (alreadyUnlocked.has(a.id)) continue;
    const value =
      a.metric === "goals_completed"
        ? stats.goalsCompleted
        : a.metric === "streak"
          ? stats.currentStreak
          : a.metric === "pet_xp"
            ? stats.petXp
            : a.metric === "pet_stage"
              ? stats.petStage
              : a.metric === "habits_completed"
                ? stats.habitsCompleted
                : stats.coinsTotal;
    if (value >= a.threshold) newly.push(a);
  }
  return newly;
}

export function findAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function rarestUnlocked(unlocked: UnlockedAchievement[]): AchievementDef | null {
  const order: AchievementRarity[] = ["legendary", "epic", "rare", "common"];
  for (const rarity of order) {
    const match = unlocked
      .map((u) => findAchievement(u.achievementId))
      .find((a): a is AchievementDef => !!a && a.rarity === rarity);
    if (match) return match;
  }
  return null;
}

export function achievementScore(unlocked: UnlockedAchievement[]): number {
  return unlocked.reduce((sum, u) => {
    const def = findAchievement(u.achievementId);
    return def ? sum + RARITY_STYLE[def.rarity].score : sum;
  }, 0);
}

export async function fetchUnlocked(userId: string): Promise<UnlockedAchievement[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: false });
  if (error) {
    console.error("fetchUnlocked", error);
    return [];
  }
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    achievementId: r.achievement_id as string,
    unlockedAt: r.unlocked_at as string,
    payload: (r.payload as Record<string, unknown> | null) ?? null,
  }));
}

export async function persistUnlocks(
  userId: string,
  achievementIds: string[],
): Promise<UnlockedAchievement[]> {
  if (!supabase || achievementIds.length === 0) return [];
  const rows = achievementIds.map((id) => ({
    user_id: userId,
    achievement_id: id,
    unlocked_at: new Date().toISOString(),
  }));
  const { data, error } = await supabase
    .from("user_achievements")
    .upsert(rows, { onConflict: "user_id,achievement_id", ignoreDuplicates: true })
    .select("*");
  if (error) {
    console.error("persistUnlocks", error);
    return [];
  }
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    achievementId: r.achievement_id as string,
    unlockedAt: r.unlocked_at as string,
    payload: (r.payload as Record<string, unknown> | null) ?? null,
  }));
}

export async function fetchLifetimeHabitCompletions(userId: string): Promise<number> {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from("habit_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gt("value", 0);
  if (error) {
    console.error("fetchLifetimeHabitCompletions", error);
    return 0;
  }
  return count ?? 0;
}

export async function fetchLifetimeCoinsEarned(userId: string): Promise<number> {
  if (!supabase) return 0;
  // Sum rewarded_dates.coins_earned across all dates as a proxy for total coins earned.
  const { data, error } = await supabase
    .from("rewarded_dates")
    .select("coins_earned")
    .eq("user_id", userId);
  if (error) {
    console.error("fetchLifetimeCoinsEarned", error);
    return 0;
  }
  return (data ?? []).reduce(
    (sum: number, r: Record<string, unknown>) => sum + ((r.coins_earned as number) ?? 0),
    0,
  );
}
