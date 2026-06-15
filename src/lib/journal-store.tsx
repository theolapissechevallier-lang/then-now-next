import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import { supabase } from "./supabase";
import {
  loadGuestJournalEntries,
  loadGuestJournalMoods,
  loadGuestJournalHighlights,
  loadGuestLifeEvents,
  saveGuestJournalEntry,
  saveGuestJournalMood,
  saveGuestJournalHighlight,
  saveGuestLifeEvent,
  clearGuestJournalData,
} from "./guest-store";
import type {
  JournalEntry,
  JournalMood,
  JournalHighlight,
  LifeEvent,
  MonthlySummary,
  JournalEntryInput,
  HighlightInput,
  LifeEventInput,
  MoodType,
  LifeEventType,
} from "./journal-types";

// XP rewards for journaling
export const JOURNAL_XP_REWARDS = {
  entryCreated: 10,   // XP for creating a journal entry
  moodLogged: 3,      // XP for logging mood
  highlightMarked: 15, // XP for marking a highlight
};

// Database types
type DbJournalEntry = {
  id: string;
  user_id: string;
  date: string;
  important_event: string | null;
  proud_of: string | null;
  learned: string | null;
  free_notes: string | null;
  created_at: string;
  updated_at: string;
};

type DbJournalMood = {
  id: string;
  user_id: string;
  date: string;
  mood: MoodType;
  created_at: string;
};

type DbJournalHighlight = {
  id: string;
  user_id: string;
  date: string;
  title: string;
  description: string | null;
  emoji: string | null;
  created_at: string;
};

type DbLifeEvent = {
  id: string;
  user_id: string;
  event_type: LifeEventType;
  event_date: string;
  title: string;
  description: string | null;
  emoji: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

type DbMonthlySummary = {
  id: string;
  user_id: string;
  year: number;
  month: number;
  summary: string;
  stats: MonthlySummary["stats"];
  created_at: string;
  updated_at: string;
};

// Context type
type JournalContext = {
  entries: JournalEntry[];
  moods: JournalMood[];
  highlights: JournalHighlight[];
  lifeEvents: LifeEvent[];
  loading: boolean;

  // Journal entries
  getEntry: (date: string) => JournalEntry | undefined;
  saveEntry: (date: string, input: JournalEntryInput) => Promise<{ ok: boolean; xpEarned: number }>;

  // Moods
  getMood: (date: string) => JournalMood | undefined;
  saveMood: (date: string, mood: MoodType) => Promise<{ ok: boolean; xpEarned: number }>;
  getMoodHistory: (days: number) => JournalMood[];

  // Highlights
  saveHighlight: (date: string, input: HighlightInput) => Promise<{ ok: boolean; xpEarned: number }>;
  removeHighlight: (date: string) => Promise<boolean>;

  // Life events
  createLifeEvent: (input: LifeEventInput) => Promise<boolean>;
  getLifeEvents: (eventType?: LifeEventType) => LifeEvent[];

  // Monthly summary
  getMonthlySummary: (year: number, month: number) => Promise<MonthlySummary | null>;

  // Refresh
  refresh: () => Promise<void>;
};

const JournalContext = createContext<JournalContext | null>(null);

// Helper to generate UID for guest mode
function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function JournalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [moods, setMoods] = useState<JournalMood[]>([]);
  const [highlights, setHighlights] = useState<JournalHighlight[]>([]);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data
  const refresh = useCallback(async () => {
    setLoading(true);

    if (!user) {
      // Guest mode - load from localStorage
      setEntries(loadGuestJournalEntries());
      setMoods(loadGuestJournalMoods());
      setHighlights(loadGuestJournalHighlights());
      setLifeEvents(loadGuestLifeEvents());
      setLoading(false);
      return;
    }

    // Load from Supabase
    if (!supabase) {
      setLoading(false);
      return;
    }

    const [entriesRes, moodsRes, highlightsRes, eventsRes] = await Promise.all([
      supabase.from("journal_entries").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      supabase.from("journal_moods").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      supabase.from("journal_highlights").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      supabase.from("life_events").select("*").eq("user_id", user.id).order("event_date", { ascending: false }),
    ]);

    if (entriesRes.data) {
      setEntries(
        (entriesRes.data as DbJournalEntry[]).map((e) => ({
          id: e.id,
          userId: e.user_id,
          date: e.date,
          importantEvent: e.important_event,
          proudOf: e.proud_of,
          learned: e.learned,
          freeNotes: e.free_notes,
          createdAt: e.created_at,
          updatedAt: e.updated_at,
        })),
      );
    }

    if (moodsRes.data) {
      setMoods(
        (moodsRes.data as DbJournalMood[]).map((m) => ({
          id: m.id,
          userId: m.user_id,
          date: m.date,
          mood: m.mood,
          createdAt: m.created_at,
        })),
      );
    }

    if (highlightsRes.data) {
      setHighlights(
        (highlightsRes.data as DbJournalHighlight[]).map((h) => ({
          id: h.id,
          userId: h.user_id,
          date: h.date,
          title: h.title,
          description: h.description,
          emoji: h.emoji,
          createdAt: h.created_at,
        })),
      );
    }

    if (eventsRes.data) {
      setLifeEvents(
        (eventsRes.data as DbLifeEvent[]).map((e) => ({
          id: e.id,
          userId: e.user_id,
          eventType: e.event_type,
          eventDate: e.event_date,
          title: e.title,
          description: e.description,
          emoji: e.emoji,
          metadata: e.metadata || {},
          createdAt: e.created_at,
        })),
      );
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Get entry for a specific date
  const getEntry = useCallback(
    (date: string) => entries.find((e) => e.date === date),
    [entries],
  );

  // Save journal entry
  const saveEntry = useCallback(
    async (date: string, input: JournalEntryInput): Promise<{ ok: boolean; xpEarned: number }> => {
      const now = new Date().toISOString();
      const existing = entries.find((e) => e.date === date);
      const isNew = !existing;
      const hasContent = input.importantEvent || input.proudOf || input.learned || input.freeNotes;
      let xpEarned = 0;

      if (!user) {
        // Guest mode
        saveGuestJournalEntry(date, input);
        setEntries((prev) => {
          const existingEntry = prev.find((e) => e.date === date);
          if (existingEntry) {
            return prev.map((e) =>
              e.date === date
                ? {
                    ...e,
                    importantEvent: input.importantEvent ?? e.importantEvent,
                    proudOf: input.proudOf ?? e.proudOf,
                    learned: input.learned ?? e.learned,
                    freeNotes: input.freeNotes ?? e.freeNotes,
                    updatedAt: now,
                  }
                : e,
            );
          }
          return [
            {
              id: uid("je"),
              userId: "guest",
              date,
              importantEvent: input.importantEvent ?? null,
              proudOf: input.proudOf ?? null,
              learned: input.learned ?? null,
              freeNotes: input.freeNotes ?? null,
              createdAt: now,
              updatedAt: now,
            },
            ...prev,
          ];
        });
        // Award XP for new entry with content
        if (isNew && hasContent) {
          xpEarned = JOURNAL_XP_REWARDS.entryCreated;
        }
        return { ok: true, xpEarned };
      }

      if (!supabase) return { ok: false, xpEarned: 0 };

      const { error } = await supabase.from("journal_entries").upsert(
        {
          user_id: user.id,
          date,
          important_event: input.importantEvent ?? null,
          proud_of: input.proudOf ?? null,
          learned: input.learned ?? null,
          free_notes: input.freeNotes ?? null,
          updated_at: now,
        },
        { onConflict: "user_id,date" },
      );

      if (error) {
        console.error("Error saving journal entry:", error);
        return { ok: false, xpEarned: 0 };
      }

      // Update local state
      setEntries((prev) => {
        const existingEntry = prev.find((e) => e.date === date);
        if (existingEntry) {
          return prev.map((e) =>
            e.date === date
              ? { ...e, ...input, updatedAt: now }
              : e,
          );
        }
        return [
          {
            id: uid("je"),
            userId: user.id,
            date,
            importantEvent: input.importantEvent ?? null,
            proudOf: input.proudOf ?? null,
            learned: input.learned ?? null,
            freeNotes: input.freeNotes ?? null,
            createdAt: now,
            updatedAt: now,
          },
          ...prev,
        ];
      });

      // Award XP for new entry with content
      if (isNew && hasContent) {
        xpEarned = JOURNAL_XP_REWARDS.entryCreated;
      }

      return { ok: true, xpEarned };
    },
    [user, entries],
  );

  // Get mood for a specific date
  const getMood = useCallback(
    (date: string) => moods.find((m) => m.date === date),
    [moods],
  );

  // Save mood
  const saveMood = useCallback(
    async (date: string, mood: MoodType): Promise<{ ok: boolean; xpEarned: number }> => {
      const now = new Date().toISOString();
      const existing = moods.find((m) => m.date === date);
      const isNew = !existing;
      let xpEarned = 0;

      if (!user) {
        // Guest mode
        saveGuestJournalMood(date, mood);
        setMoods((prev) => {
          const existingMood = prev.find((m) => m.date === date);
          if (existingMood) {
            return prev.map((m) => (m.date === date ? { ...m, mood } : m));
          }
          return [{ id: uid("jm"), userId: "guest", date, mood, createdAt: now }, ...prev];
        });
        if (isNew) {
          xpEarned = JOURNAL_XP_REWARDS.moodLogged;
        }
        return { ok: true, xpEarned };
      }

      if (!supabase) return { ok: false, xpEarned: 0 };

      const { error } = await supabase.from("journal_moods").upsert(
        { user_id: user.id, date, mood },
        { onConflict: "user_id,date" },
      );

      if (error) {
        console.error("Error saving mood:", error);
        return { ok: false, xpEarned: 0 };
      }

      setMoods((prev) => {
        const existingMood = prev.find((m) => m.date === date);
        if (existingMood) {
          return prev.map((m) => (m.date === date ? { ...m, mood } : m));
        }
        return [{ id: uid("jm"), userId: user.id, date, mood, createdAt: now }, ...prev];
      });

      if (isNew) {
        xpEarned = JOURNAL_XP_REWARDS.moodLogged;
      }

      return { ok: true, xpEarned };
    },
    [user, moods],
  );

  // Get mood history for last N days
  const getMoodHistory = useCallback(
    (days: number) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      return moods.filter((m) => m.date >= cutoffStr).sort((a, b) => b.date.localeCompare(a.date));
    },
    [moods],
  );

  // Create life event (internal, used by saveHighlight and others)
  const createLifeEventInternal = useCallback(
    async (input: LifeEventInput): Promise<boolean> => {
      const now = new Date().toISOString();

      if (!user) {
        // Guest mode
        saveGuestLifeEvent(input);
        setLifeEvents((prev) => [
          {
            id: uid("le"),
            userId: "guest",
            eventType: input.eventType,
            eventDate: input.eventDate,
            title: input.title,
            description: input.description ?? null,
            emoji: input.emoji ?? null,
            metadata: input.metadata ?? {},
            createdAt: now,
          },
          ...prev,
        ]);
        return true;
      }

      if (!supabase) return false;

      const { data, error } = await supabase
        .from("life_events")
        .insert({
          user_id: user.id,
          event_type: input.eventType,
          event_date: input.eventDate,
          title: input.title,
          description: input.description ?? null,
          emoji: input.emoji ?? null,
          metadata: input.metadata ?? {},
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating life event:", error);
        return false;
      }

      const dbEvent = data as DbLifeEvent;
      setLifeEvents((prev) => [
        {
          id: dbEvent.id,
          userId: dbEvent.user_id,
          eventType: dbEvent.event_type,
          eventDate: dbEvent.event_date,
          title: dbEvent.title,
          description: dbEvent.description,
          emoji: dbEvent.emoji,
          metadata: dbEvent.metadata || {},
          createdAt: dbEvent.created_at,
        },
        ...prev,
      ]);

      return true;
    },
    [user, lifeEvents],
  );

  // Save highlight of the day
  const saveHighlight = useCallback(
    async (date: string, input: HighlightInput): Promise<{ ok: boolean; xpEarned: number }> => {
      const now = new Date().toISOString();
      const existing = highlights.find((h) => h.date === date);
      const isNew = !existing;
      let xpEarned = 0;

      if (!user) {
        // Guest mode
        saveGuestJournalHighlight(date, input);
        setHighlights((prev) => {
          const existingHighlight = prev.find((h) => h.date === date);
          if (existingHighlight) {
            return prev.map((h) =>
              h.date === date
                ? { ...h, title: input.title, description: input.description ?? null, emoji: input.emoji ?? null }
                : h,
            );
          }
          return [
            {
              id: uid("jh"),
              userId: "guest",
              date,
              title: input.title,
              description: input.description ?? null,
              emoji: input.emoji ?? null,
              createdAt: now,
            },
            ...prev,
          ];
        });
        if (isNew) {
          xpEarned = JOURNAL_XP_REWARDS.highlightMarked;
        }
        return { ok: true, xpEarned };
      }

      if (!supabase) return { ok: false, xpEarned: 0 };

      const { error } = await supabase.from("journal_highlights").upsert(
        {
          user_id: user.id,
          date,
          title: input.title,
          description: input.description ?? null,
          emoji: input.emoji ?? null,
        },
        { onConflict: "user_id,date" },
      );

      if (error) {
        console.error("Error saving highlight:", error);
        return { ok: false, xpEarned: 0 };
      }

      setHighlights((prev) => {
        const existingHighlight = prev.find((h) => h.date === date);
        if (existingHighlight) {
          return prev.map((h) =>
            h.date === date
              ? { ...h, title: input.title, description: input.description ?? null, emoji: input.emoji ?? null }
              : h,
          );
        }
        return [
          {
            id: uid("jh"),
            userId: user.id,
            date,
            title: input.title,
            description: input.description ?? null,
            emoji: input.emoji ?? null,
            createdAt: now,
          },
          ...prev,
        ];
      });

      // Also create a life event
      await createLifeEventInternal({
        eventType: "journal_highlight",
        eventDate: date,
        title: `Highlight: ${input.title}`,
        description: input.description ?? undefined,
        emoji: input.emoji ?? "⭐",
      });

      if (isNew) {
        xpEarned = JOURNAL_XP_REWARDS.highlightMarked;
      }

      return { ok: true, xpEarned };
    },
    [user, highlights, createLifeEventInternal],
  );

  // Remove highlight
  const removeHighlight = useCallback(
    async (date: string): Promise<boolean> => {
      if (!user) {
        setHighlights((prev) => prev.filter((h) => h.date !== date));
        return true;
      }

      if (!supabase) return false;

      const { error } = await supabase.from("journal_highlights").delete().eq("user_id", user.id).eq("date", date);

      if (error) {
        console.error("Error removing highlight:", error);
        return false;
      }

      setHighlights((prev) => prev.filter((h) => h.date !== date));
      return true;
    },
    [user],
  );

  // Public method to create life event (used by external integrations)
  const createLifeEvent = useCallback(
    async (input: LifeEventInput): Promise<boolean> => {
      return createLifeEventInternal(input);
    },
    [createLifeEventInternal],
  );

  // Get life events, optionally filtered by type
  const getLifeEvents = useCallback(
    (eventType?: LifeEventType) => {
      if (!eventType) return lifeEvents;
      return lifeEvents.filter((e) => e.eventType === eventType);
    },
    [lifeEvents],
  );

  // Get or generate monthly summary
  const getMonthlySummary = useCallback(
    async (year: number, month: number): Promise<MonthlySummary | null> => {
      if (!user) {
        // Generate summary from local data for guest mode
        const monthEntries = entries.filter((e) => {
          const d = new Date(e.date);
          return d.getFullYear() === year && d.getMonth() + 1 === month;
        });
        const monthMoods = moods.filter((m) => {
          const d = new Date(m.date);
          return d.getFullYear() === year && d.getMonth() + 1 === month;
        });

        const moodCounts: Record<MoodType, number> = {
          amazing: 0,
          happy: 0,
          good: 0,
          neutral: 0,
          tired: 0,
          bad: 0,
        };
        for (const m of monthMoods) {
          moodCounts[m.mood]++;
        }
        const topMood = (Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as MoodType) ?? null;

        return {
          id: `summary-${year}-${month}`,
          userId: "guest",
          year,
          month,
          summary: `${monthEntries.length} journal entries recorded`,
          stats: {
            journalEntries: monthEntries.length,
            goalsCompleted: 0,
            trophiesUnlocked: 0,
            xpEarned: 0,
            streakDays: 0,
            topMood,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      if (!supabase) return null;

      // Check for existing summary
      const { data: existing } = await supabase
        .from("monthly_summaries")
        .select("*")
        .eq("user_id", user.id)
        .eq("year", year)
        .eq("month", month)
        .maybeSingle();

      if (existing) {
        const dbSummary = existing as DbMonthlySummary;
        return {
          id: dbSummary.id,
          userId: dbSummary.user_id,
          year: dbSummary.year,
          month: dbSummary.month,
          summary: dbSummary.summary,
          stats: dbSummary.stats,
          createdAt: dbSummary.created_at,
          updatedAt: dbSummary.updated_at,
        };
      }

      // Generate summary from data
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`;

      const [entriesRes, moodsRes, eventsRes, profileRes] = await Promise.all([
        supabase.from("journal_entries").select("id").eq("user_id", user.id).gte("date", startDate).lte("date", endDate),
        supabase.from("journal_moods").select("mood").eq("user_id", user.id).gte("date", startDate).lte("date", endDate),
        supabase
          .from("life_events")
          .select("event_type")
          .eq("user_id", user.id)
          .gte("event_date", startDate)
          .lte("event_date", endDate),
        supabase.from("profiles").select("streak, xp").eq("id", user.id).single(),
      ]);

      const journalEntries = entriesRes.data?.length ?? 0;
      const moodCounts: Record<MoodType, number> = {
        amazing: 0,
        happy: 0,
        good: 0,
        neutral: 0,
        tired: 0,
        bad: 0,
      };
      for (const m of moodsRes.data ?? []) {
        moodCounts[m.mood as MoodType]++;
      }
      const topMood = (Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as MoodType) ?? null;

      const events = eventsRes.data ?? [];
      const goalsCompleted = events.filter((e) => e.event_type === "goal_completed").length;
      const trophiesUnlocked = events.filter((e) => e.event_type === "trophy_unlocked").length;
      const streakDays = (profileRes.data as { streak: number } | null)?.streak ?? 0;

      // Build summary text
      const summary = generateSummaryText(journalEntries, goalsCompleted, trophiesUnlocked, topMood);

      const stats: MonthlySummary["stats"] = {
        journalEntries,
        goalsCompleted,
        trophiesUnlocked,
        xpEarned: 0,
        streakDays,
        topMood,
      };

      // Save the summary
      const { data: saved, error } = await supabase
        .from("monthly_summaries")
        .upsert(
          {
            user_id: user.id,
            year,
            month,
            summary,
            stats,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,year,month" },
        )
        .select()
        .single();

      if (error) {
        console.error("Error saving monthly summary:", error);
        return null;
      }

      const dbSummary = saved as DbMonthlySummary;
      return {
        id: dbSummary.id,
        userId: dbSummary.user_id,
        year: dbSummary.year,
        month: dbSummary.month,
        summary: dbSummary.summary,
        stats: dbSummary.stats,
        createdAt: dbSummary.created_at,
        updatedAt: dbSummary.updated_at,
      };
    },
    [user, entries, moods],
  );

  return (
    <JournalContext.Provider
      value={{
        entries,
        moods,
        highlights,
        lifeEvents,
        loading,
        getEntry,
        saveEntry,
        getMood,
        saveMood,
        getMoodHistory,
        saveHighlight,
        removeHighlight,
        createLifeEvent,
        getLifeEvents,
        getMonthlySummary,
        refresh,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error("useJournal must be used within JournalProvider");
  return ctx;
}

// Helper to generate summary text
function generateSummaryText(
  journalEntries: number,
  goalsCompleted: number,
  trophiesUnlocked: number,
  topMood: MoodType | null,
): string {
  const parts: string[] = [];

  if (journalEntries > 0) {
    parts.push(`${journalEntries} journal ${journalEntries === 1 ? "entry" : "entries"}`);
  }
  if (goalsCompleted > 0) {
    parts.push(`${goalsCompleted} ${goalsCompleted === 1 ? "goal" : "goals"} completed`);
  }
  if (trophiesUnlocked > 0) {
    parts.push(`${trophiesUnlocked} ${trophiesUnlocked === 1 ? "trophy" : "trophies"} unlocked`);
  }
  if (topMood) {
    parts.push(`most common mood: ${topMood}`);
  }

  if (parts.length === 0) {
    return "A quiet month - start tracking to see your progress!";
  }
  return `This month: ${parts.join(", ")}.`;
}
