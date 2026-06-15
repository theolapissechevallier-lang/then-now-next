// Guest-mode persistence helpers. All keys live in localStorage so users can
// experience the app without signing in. When they later create an account
// we migrate everything via migrateLocalData / migrateGuestData.

import type { Goal, GoalInput, GoalStatus, GoalType, GoalDifficulty } from "./goals";
import type { UnlockedAchievement } from "./achievements";
import type { JournalEntryInput, MoodType, HighlightInput, LifeEventInput } from "./journal-types";

const GOALS_KEY = "future-me:guest:goals";
const ACHIEVEMENTS_KEY = "future-me:guest:achievements";
const JOURNAL_ENTRIES_KEY = "future-me:guest:journal_entries";
const JOURNAL_MOODS_KEY = "future-me:guest:journal_moods";
const JOURNAL_HIGHLIGHTS_KEY = "future-me:guest:journal_highlights";
const LIFE_EVENTS_KEY = "future-me:guest:life_events";

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- Goals ----------

export function loadGuestGoals(): Goal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Goal[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function persistGuestGoals(goals: Goal[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function createGuestGoal(input: GoalInput): Goal {
  const now = new Date().toISOString();
  const g: Goal = {
    id: uid("goal"),
    userId: "guest",
    title: input.title,
    description: input.description ?? null,
    category: input.category ?? "general",
    icon: input.icon ?? "Target",
    color: input.color ?? "primary",
    goalType: input.goalType,
    difficulty: input.difficulty,
    targetValue: input.goalType === "simple" ? 1 : input.targetValue,
    currentValue: 0,
    unit: input.goalType === "simple" ? "done" : input.unit,
    deadline: input.deadline ?? null,
    rewardCoins: input.rewardCoins,
    rewardXp: input.rewardXp,
    rewardItem: input.rewardItem ?? null,
    status: "active",
    completedAt: null,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  };
  const list = loadGuestGoals();
  persistGuestGoals([g, ...list]);
  return g;
}

export function updateGuestGoal(
  id: string,
  patch: Partial<
    GoalInput & { currentValue: number; status: GoalStatus; completedAt: string | null }
  >,
): boolean {
  const list = loadGuestGoals();
  const idx = list.findIndex((g) => g.id === id);
  if (idx === -1) return false;
  const cur = list[idx]!;
  const updated: Goal = {
    ...cur,
    title: patch.title ?? cur.title,
    description: patch.description ?? cur.description,
    category: patch.category ?? cur.category,
    icon: patch.icon ?? cur.icon,
    color: patch.color ?? cur.color,
    goalType: (patch.goalType as GoalType) ?? cur.goalType,
    difficulty: (patch.difficulty as GoalDifficulty) ?? cur.difficulty,
    targetValue: patch.targetValue ?? cur.targetValue,
    currentValue: patch.currentValue ?? cur.currentValue,
    unit: patch.unit ?? cur.unit,
    deadline: patch.deadline ?? cur.deadline,
    rewardCoins: patch.rewardCoins ?? cur.rewardCoins,
    rewardXp: patch.rewardXp ?? cur.rewardXp,
    rewardItem: patch.rewardItem ?? cur.rewardItem,
    status: patch.status ?? cur.status,
    completedAt: patch.completedAt ?? cur.completedAt,
    updatedAt: new Date().toISOString(),
  };
  list[idx] = updated;
  persistGuestGoals(list);
  return true;
}

export function deleteGuestGoal(id: string): boolean {
  const list = loadGuestGoals();
  const next = list.filter((g) => g.id !== id);
  if (next.length === list.length) return false;
  persistGuestGoals(next);
  return true;
}

// ---------- Achievements ----------

export function loadGuestAchievements(): UnlockedAchievement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as UnlockedAchievement[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function persistGuestAchievements(list: UnlockedAchievement[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(list));
}

export function unlockGuestAchievements(ids: string[]): UnlockedAchievement[] {
  const list = loadGuestAchievements();
  const known = new Set(list.map((u) => u.achievementId));
  const newly: UnlockedAchievement[] = [];
  const now = new Date().toISOString();
  for (const id of ids) {
    if (known.has(id)) continue;
    const row: UnlockedAchievement = {
      id: uid("ach"),
      achievementId: id,
      unlockedAt: now,
      payload: null,
    };
    newly.push(row);
  }
  if (newly.length === 0) return [];
  persistGuestAchievements([...newly, ...list]);
  return newly;
}

// ---------- Journal entries ----------

export function loadGuestJournalEntries() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(JOURNAL_ENTRIES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function persistGuestJournalEntries(entries: unknown[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
}

export function saveGuestJournalEntry(date: string, input: JournalEntryInput) {
  const entries = loadGuestJournalEntries();
  const now = new Date().toISOString();
  const existing = entries.find((e: { date: string }) => e.date === date);
  if (existing) {
    Object.assign(existing, input, { updatedAt: now });
  } else {
    entries.unshift({
      id: uid("je"),
      userId: "guest",
      date,
      ...input,
      createdAt: now,
      updatedAt: now,
    });
  }
  persistGuestJournalEntries(entries);
}

// ---------- Journal moods ----------

export function loadGuestJournalMoods() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(JOURNAL_MOODS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function persistGuestJournalMoods(moods: unknown[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(JOURNAL_MOODS_KEY, JSON.stringify(moods));
}

export function saveGuestJournalMood(date: string, mood: MoodType) {
  const moods = loadGuestJournalMoods();
  const now = new Date().toISOString();
  const existing = moods.find((m: { date: string }) => m.date === date);
  if (existing) {
    existing.mood = mood;
  } else {
    moods.unshift({ id: uid("jm"), userId: "guest", date, mood, createdAt: now });
  }
  persistGuestJournalMoods(moods);
}

// ---------- Journal highlights ----------

export function loadGuestJournalHighlights() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(JOURNAL_HIGHLIGHTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function persistGuestJournalHighlights(highlights: unknown[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(JOURNAL_HIGHLIGHTS_KEY, JSON.stringify(highlights));
}

export function saveGuestJournalHighlight(date: string, input: HighlightInput) {
  const highlights = loadGuestJournalHighlights();
  const now = new Date().toISOString();
  const existing = highlights.find((h: { date: string }) => h.date === date);
  if (existing) {
    Object.assign(existing, input);
  } else {
    highlights.unshift({
      id: uid("jh"),
      userId: "guest",
      date,
      ...input,
      createdAt: now,
    });
  }
  persistGuestJournalHighlights(highlights);
}

// ---------- Life events ----------

export function loadGuestLifeEvents() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LIFE_EVENTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function persistGuestLifeEvents(events: unknown[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LIFE_EVENTS_KEY, JSON.stringify(events));
}

export function saveGuestLifeEvent(input: LifeEventInput) {
  const events = loadGuestLifeEvents();
  const now = new Date().toISOString();
  events.unshift({
    id: uid("le"),
    userId: "guest",
    ...input,
    metadata: input.metadata ?? {},
    createdAt: now,
  });
  persistGuestLifeEvents(events);
}

// ---------- Helpers used by migration ----------

export function clearGuestData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GOALS_KEY);
  localStorage.removeItem(ACHIEVEMENTS_KEY);
}

export function clearGuestJournalData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(JOURNAL_ENTRIES_KEY);
  localStorage.removeItem(JOURNAL_MOODS_KEY);
  localStorage.removeItem(JOURNAL_HIGHLIGHTS_KEY);
  localStorage.removeItem(LIFE_EVENTS_KEY);
}

// True when the user has done something meaningful that's worth preserving.
export function hasMeaningfulGuestProgress(args: {
  goals: number;
  unlocked: number;
  habitLogs: number;
  coins: number;
  startingCoins?: number;
}): boolean {
  const starting = args.startingCoins ?? 50;
  return (
    args.goals > 0 ||
    args.unlocked > 0 ||
    args.habitLogs > 0 ||
    args.coins > starting
  );
}
