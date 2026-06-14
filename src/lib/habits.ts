// Habit types and utilities

export type HabitCategory =
  | "health"
  | "fitness"
  | "learning"
  | "productivity"
  | "mindfulness"
  | "social"
  | "creativity"
  | "finance"
  | "general";

export type HabitDifficulty = "easy" | "medium" | "hard";
export type habitColor = "primary" | "accent" | "success" | "warn" | "danger";

export type HabitIcon =
  | "Smartphone"
  | "Dumbbell"
  | "BookOpen"
  | "GraduationCap"
  | "Moon"
  | "Brain"
  | "Heart"
  | "DollarSign"
  | "Users"
  | "Palette"
  | "Music"
  | "Code"
  | "Coffee"
  | "Apple"
  | "Bike"
  | "Footprints"
  | "Timer"
  | "Target"
  | "Trophy"
  | "Flame"
  | "Zap"
  | "Sun"
  | "Star"
  | "Award"
  | "Activity";

export interface Habit {
  id: string;
  userId?: string;
  name: string;
  icon: HabitIcon;
  category: HabitCategory;
  color: habitColor;
  difficulty: HabitDifficulty;
  rewardPerUnit: number;
  xpPerUnit: number;
  unit: string;
  targetPerDay: number;
  isActive: boolean;
  sortOrder: number;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  value: number;
  coinsEarned: number;
  xpEarned: number;
}

export interface HabitWithLog extends Habit {
  todayLog?: HabitLog;
}

// Icon to Lucide component mapping
export const ICON_OPTIONS: { value: HabitIcon; label: string }[] = [
  { value: "Smartphone", label: "Phone/Screen" },
  { value: "Dumbbell", label: "Workout" },
  { value: "BookOpen", label: "Reading" },
  { value: "GraduationCap", label: "Study" },
  { value: "Moon", label: "Sleep" },
  { value: "Brain", label: "Focus/Deep Work" },
  { value: "Heart", label: "Health/Wellness" },
  { value: "DollarSign", label: "Money/Finance" },
  { value: "Users", label: "Social" },
  { value: "Palette", label: "Creative" },
  { value: "Music", label: "Music" },
  { value: "Code", label: "Coding" },
  { value: "Coffee", label: "Break/Coffee" },
  { value: "Apple", label: "Nutrition" },
  { value: "Bike", label: "Cycling" },
  { value: "Footprints", label: "Walking" },
  { value: "Timer", label: "Time Tracking" },
  { value: "Target", label: "Goals" },
  { value: "Trophy", label: "Achievements" },
  { value: "Flame", label: "Streaks" },
  { value: "Zap", label: "Energy" },
  { value: "Sun", label: "Morning" },
  { value: "Star", label: "Favorites" },
  { value: "Award", label: "Rewards" },
];

export const CATEGORY_OPTIONS: { value: HabitCategory; label: string }[] = [
  { value: "health", label: "Health" },
  { value: "fitness", label: "Fitness" },
  { value: "learning", label: "Learning" },
  { value: "productivity", label: "Productivity" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "social", label: "Social" },
  { value: "creativity", label: "Creativity" },
  { value: "finance", label: "Finance" },
  { value: "general", label: "General" },
];

export const COLOR_OPTIONS: { value: habitColor; label: string }[] = [
  { value: "primary", label: "Green (Primary)" },
  { value: "accent", label: "Orange (Accent)" },
  { value: "success", label: "Green (Success)" },
  { value: "warn", label: "Yellow (Warning)" },
  { value: "danger", label: "Red (Danger)" },
];

export const DIFFICULTY_OPTIONS: { value: HabitDifficulty; label: string; multiplier: number }[] = [
  { value: "easy", label: "Easy", multiplier: 1 },
  { value: "medium", label: "Medium", multiplier: 1.5 },
  { value: "hard", label: "Hard", multiplier: 2 },
];

export const UNIT_OPTIONS: { value: string; label: string }[] = [
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "count", label: "Times/Count" },
  { value: "pages", label: "Pages" },
  { value: "steps", label: "Steps" },
  { value: "glasses", label: "Glasses" },
  { value: "meals", label: "Meals" },
  { value: "sessions", label: "Sessions" },
];

// Default habits that users start with
export const DEFAULT_HABITS: Omit<Habit, "id" | "userId">[] = [
  {
    name: "Screen time",
    icon: "Smartphone",
    category: "productivity",
    color: "danger",
    difficulty: "medium",
    rewardPerUnit: 0,
    xpPerUnit: 0,
    unit: "hours",
    targetPerDay: 2,
    isActive: true,
    sortOrder: 0,
    isDefault: true,
  },
  {
    name: "Workout",
    icon: "Dumbbell",
    category: "fitness",
    color: "primary",
    difficulty: "hard",
    rewardPerUnit: 3,
    xpPerUnit: 4,
    unit: "minutes",
    targetPerDay: 45,
    isActive: true,
    sortOrder: 1,
    isDefault: true,
  },
  {
    name: "Reading",
    icon: "BookOpen",
    category: "learning",
    color: "accent",
    difficulty: "easy",
    rewardPerUnit: 2,
    xpPerUnit: 2,
    unit: "minutes",
    targetPerDay: 30,
    isActive: true,
    sortOrder: 2,
    isDefault: true,
  },
  {
    name: "Study",
    icon: "GraduationCap",
    category: "learning",
    color: "primary",
    difficulty: "medium",
    rewardPerUnit: 3,
    xpPerUnit: 3,
    unit: "minutes",
    targetPerDay: 60,
    isActive: true,
    sortOrder: 3,
    isDefault: true,
  },
  {
    name: "Deep work",
    icon: "Brain",
    category: "productivity",
    color: "accent",
    difficulty: "hard",
    rewardPerUnit: 4,
    xpPerUnit: 5,
    unit: "minutes",
    targetPerDay: 120,
    isActive: true,
    sortOrder: 4,
    isDefault: true,
  },
  {
    name: "Sleep",
    icon: "Moon",
    category: "health",
    color: "primary",
    difficulty: "easy",
    rewardPerUnit: 8,
    xpPerUnit: 6,
    unit: "hours",
    targetPerDay: 8,
    isActive: true,
    sortOrder: 5,
    isDefault: true,
  },
];

// Calculate coins for a habit log
export function calculateHabitCoins(habit: Habit, value: number): number {
  if (habit.rewardPerUnit === 0) {
    return 0;
  }
  const difficulty = DIFFICULTY_OPTIONS.find((d) => d.value === habit.difficulty);
  const multiplier = difficulty?.multiplier ?? 1;
  let units = 0;
  if (habit.unit === "hours") units = value;
  else if (habit.unit === "minutes") units = Math.floor(value / 15);
  else units = value;
  return Math.floor(units * habit.rewardPerUnit * multiplier);
}

// Calculate XP for a habit log (same unit logic, scaled by xpPerUnit)
export function calculateHabitXp(habit: Habit, value: number): number {
  if (habit.xpPerUnit === 0) return 0;
  const difficulty = DIFFICULTY_OPTIONS.find((d) => d.value === habit.difficulty);
  const multiplier = difficulty?.multiplier ?? 1;
  let units = 0;
  if (habit.unit === "hours") units = value;
  else if (habit.unit === "minutes") units = Math.floor(value / 15);
  else units = value;
  return Math.floor(units * habit.xpPerUnit * multiplier);
}

// Calculate progress percentage for a habit today
export function calculateHabitProgress(habit: Habit, todayValue: number): number {
  if (habit.targetPerDay <= 0) return 0;
  return Math.min(1, todayValue / habit.targetPerDay);
}
