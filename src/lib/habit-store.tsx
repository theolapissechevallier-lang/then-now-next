import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useAuth } from "./auth-context";
import {
  loadUserHabits,
  loadHabitLogs,
  createDefaultHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  saveHabitLog,
  reorderHabits,
} from "./data-sync";
import {
  type Habit,
  type HabitLog,
  type HabitWithLog,
  type HabitCategory,
  type HabitDifficulty,
  type habitColor,
  type HabitIcon,
  DEFAULT_HABITS,
  calculateHabitCoins,
  calculateHabitXp,
} from "./habits";
import type { AppState } from "./store";

type HabitState = {
  habits: Habit[];
  todayLogs: Record<string, HabitLog>;
  loading: boolean;
};

type HabitActions = {
  createHabit: (habit: Omit<Habit, "id" | "userId">) => Promise<Habit | null>;
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<boolean>;
  deleteHabit: (habitId: string) => Promise<boolean>;
  setHabitValue: (habitId: string, value: number) => Promise<void>;
  getHabitWithLog: (habitId: string) => HabitWithLog | undefined;
  getTodaysCoins: () => number;
  reorderHabits: (habitIds: string[]) => Promise<boolean>;
  refreshHabits: () => Promise<void>;
};

const HabitContext = createContext<(HabitState & HabitActions) | null>(null);

export function HabitProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<Record<string, HabitLog>>({});
  const [loading, setLoading] = useState(true);

  const todayKey = () => new Date().toISOString().slice(0, 10);

  const refreshHabits = useCallback(async () => {
    if (!user) {
      // No user - use default habits in local mode
      const localHabits = loadLocalHabits();
      setHabits(localHabits);
      const localLogs = loadLocalHabitLogs(todayKey());
      setTodayLogs(localLogs);
      setLoading(false);
      return;
    }

    let loadedHabits = await loadUserHabits(user);

    // If no habits exist, create defaults
    if (loadedHabits.length === 0) {
      loadedHabits = await createDefaultHabits(user);
    }

    setHabits(loadedHabits);

    // Load today's logs
    const logs = await loadHabitLogs(user, todayKey());
    const logsMap: Record<string, HabitLog> = {};
    for (const log of logs) {
      logsMap[log.habitId] = log;
    }
    setTodayLogs(logsMap);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshHabits();
  }, [refreshHabits]);

  const createHabitHandler = useCallback(
    async (habit: Omit<Habit, "id" | "userId">) => {
      if (!user) {
        // Local mode
        const newHabit: Habit = {
          id: `local-${Date.now()}`,
          userId: undefined,
          ...habit,
          sortOrder: habits.length,
          isDefault: false,
        };
        const updatedHabits = [...habits, newHabit];
        setHabits(updatedHabits);
        saveLocalHabits(updatedHabits);
        return newHabit;
      }

      const newHabit = await createHabit(user, habit);
      if (newHabit) {
        setHabits((prev) => [...prev, newHabit]);
      }
      return newHabit;
    },
    [user, habits],
  );

  const updateHabitHandler = useCallback(
    async (habitId: string, updates: Partial<Habit>) => {
      if (!user) {
        // Local mode
        const updatedHabits = habits.map((h) => (h.id === habitId ? { ...h, ...updates } : h));
        setHabits(updatedHabits);
        saveLocalHabits(updatedHabits);
        return true;
      }

      const success = await updateHabit(user, habitId, updates);
      if (success) {
        setHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, ...updates } : h)));
      }
      return success;
    },
    [user, habits],
  );

  const deleteHabitHandler = useCallback(
    async (habitId: string) => {
      if (!user) {
        // Local mode
        const updatedHabits = habits.filter((h) => h.id !== habitId);
        setHabits(updatedHabits);
        saveLocalHabits(updatedHabits);
        return true;
      }

      const success = await deleteHabit(user, habitId);
      if (success) {
        setHabits((prev) => prev.filter((h) => h.id !== habitId));
      }
      return success;
    },
    [user, habits],
  );

  const setHabitValue = useCallback(
    async (habitId: string, value: number) => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      const coinsEarned = calculateHabitCoins(habit, value);
      const xpEarned = calculateHabitXp(habit, value);

      if (!user) {
        // Local mode
        const log: HabitLog = {
          id: `log-${habitId}-${todayKey()}`,
          habitId,
          date: todayKey(),
          value,
          coinsEarned,
          xpEarned,
        };
        setTodayLogs((prev) => ({ ...prev, [habitId]: log }));
        saveLocalHabitLog(todayKey(), habitId, log);
        return;
      }

      const log = await saveHabitLog(user, habitId, todayKey(), value, coinsEarned, xpEarned);
      if (log) {
        setTodayLogs((prev) => ({ ...prev, [habitId]: log }));
      }
    },
    [user, habits],
  );

  const getHabitWithLog = useCallback(
    (habitId: string): HabitWithLog | undefined => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return undefined;
      return {
        ...habit,
        todayLog: todayLogs[habitId],
      };
    },
    [habits, todayLogs],
  );

  const getTodaysCoins = useCallback((): number => {
    return Object.values(todayLogs).reduce((sum, log) => sum + log.coinsEarned, 0);
  }, [todayLogs]);

  const reorderHabitsHandler = useCallback(
    async (habitIds: string[]) => {
      if (!user) {
        // Local mode
        const reorderedHabits = habitIds
          .map((id) => habits.find((h) => h.id === id))
          .filter((h): h is Habit => h !== undefined)
          .map((h, index) => ({ ...h, sortOrder: index }));
        setHabits(reorderedHabits);
        saveLocalHabits(reorderedHabits);
        return true;
      }

      const success = await reorderHabits(user, habitIds);
      if (success) {
        const reorderedHabits = habitIds
          .map((id) => habits.find((h) => h.id === id))
          .filter((h): h is Habit => h !== undefined)
          .map((h, index) => ({ ...h, sortOrder: index }));
        setHabits(reorderedHabits);
      }
      return success;
    },
    [user, habits],
  );

  return (
    <HabitContext.Provider
      value={{
        habits,
        todayLogs,
        loading,
        createHabit: createHabitHandler,
        updateHabit: updateHabitHandler,
        deleteHabit: deleteHabitHandler,
        setHabitValue,
        getHabitWithLog,
        getTodaysCoins,
        reorderHabits: reorderHabitsHandler,
        refreshHabits,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error("useHabits must be used within a HabitProvider");
  }
  return context;
}

// Local storage helpers for offline mode
const HABITS_KEY = "future-me-habits";
const HABIT_LOGS_KEY = "future-me-habit-logs";

function loadLocalHabits(): Habit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (!raw) {
      return DEFAULT_HABITS.map((h, index) => ({
        id: `default-${index}`,
        ...h,
        userId: undefined,
      }));
    }
    const parsed = JSON.parse(raw) as Array<Partial<Habit>>;
    return parsed.map((h, index) => ({
      id: h.id ?? `local-${index}`,
      userId: h.userId,
      name: h.name ?? "Untitled",
      icon: h.icon ?? "Activity",
      category: h.category ?? "general",
      color: h.color ?? "primary",
      difficulty: h.difficulty ?? "medium",
      rewardPerUnit: h.rewardPerUnit ?? 0,
      xpPerUnit: h.xpPerUnit ?? 0,
      unit: h.unit ?? "minutes",
      targetPerDay: h.targetPerDay ?? 30,
      isActive: h.isActive ?? true,
      sortOrder: h.sortOrder ?? index,
      isDefault: h.isDefault ?? false,
      createdAt: h.createdAt,
      updatedAt: h.updatedAt,
    }));
  } catch {
    return DEFAULT_HABITS.map((h, index) => ({
      id: `default-${index}`,
      ...h,
      userId: undefined,
    }));
  }
}

function saveLocalHabits(habits: Habit[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

function loadLocalHabitLogs(date: string): Record<string, HabitLog> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`${HABIT_LOGS_KEY}-${date}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Partial<HabitLog>>;
    const out: Record<string, HabitLog> = {};
    for (const [k, v] of Object.entries(parsed)) {
      out[k] = {
        id: v.id ?? `log-${k}-${date}`,
        habitId: v.habitId ?? k,
        date: v.date ?? date,
        value: v.value ?? 0,
        coinsEarned: v.coinsEarned ?? 0,
        xpEarned: v.xpEarned ?? 0,
      };
    }
    return out;
  } catch {
    return {};
  }
}

function saveLocalHabitLog(date: string, habitId: string, log: HabitLog) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(`${HABIT_LOGS_KEY}-${date}`);
    const logs: Record<string, HabitLog> = raw ? JSON.parse(raw) : {};
    logs[habitId] = log;
    localStorage.setItem(`${HABIT_LOGS_KEY}-${date}`, JSON.stringify(logs));
  } catch {
    localStorage.setItem(`${HABIT_LOGS_KEY}-${date}`, JSON.stringify({ [habitId]: log }));
  }
}
