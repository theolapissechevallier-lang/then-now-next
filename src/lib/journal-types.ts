// Journal system types

export type MoodType = "amazing" | "happy" | "good" | "neutral" | "tired" | "bad";

export type LifeEventType =
  | "journal_highlight"
  | "goal_completed"
  | "trophy_unlocked"
  | "pet_evolved"
  | "milestone"
  | "streak";

export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  importantEvent: string | null;
  proudOf: string | null;
  learned: string | null;
  freeNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JournalMood {
  id: string;
  userId: string;
  date: string;
  mood: MoodType;
  createdAt: string;
}

export interface JournalHighlight {
  id: string;
  userId: string;
  date: string;
  title: string;
  description: string | null;
  emoji: string | null;
  createdAt: string;
}

export interface LifeEvent {
  id: string;
  userId: string;
  eventType: LifeEventType;
  eventDate: string;
  title: string;
  description: string | null;
  emoji: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface MonthlySummary {
  id: string;
  userId: string;
  year: number;
  month: number;
  summary: string;
  stats: {
    journalEntries: number;
    goalsCompleted: number;
    trophiesUnlocked: number;
    xpEarned: number;
    streakDays: number;
    topMood: MoodType | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryInput {
  importantEvent?: string;
  proudOf?: string;
  learned?: string;
  freeNotes?: string;
}

export interface HighlightInput {
  title: string;
  description?: string;
  emoji?: string;
}

export interface LifeEventInput {
  eventType: LifeEventType;
  eventDate: string;
  title: string;
  description?: string;
  emoji?: string;
  metadata?: Record<string, unknown>;
}

// Mood metadata for UI
export const MOOD_CONFIG: Record<MoodType, { label: string; emoji: string; color: string }> = {
  amazing: { label: "Amazing", emoji: "🌟", color: "text-amber-500" },
  happy: { label: "Happy", emoji: "😊", color: "text-green-500" },
  good: { label: "Good", emoji: "🙂", color: "text-blue-500" },
  neutral: { label: "Neutral", emoji: "😐", color: "text-gray-500" },
  tired: { label: "Tired", emoji: "😴", color: "text-purple-500" },
  bad: { label: "Bad", emoji: "😔", color: "text-red-500" },
};

// Default empty journal entry for a date
export function defaultJournalEntry(userId: string, date: string): JournalEntry {
  const now = new Date().toISOString();
  return {
    id: `je-${date}`,
    userId,
    date,
    importantEvent: null,
    proudOf: null,
    learned: null,
    freeNotes: null,
    createdAt: now,
    updatedAt: now,
  };
}
