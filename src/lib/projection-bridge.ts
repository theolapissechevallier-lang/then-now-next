import { useMemo } from "react";
import { useHabits } from "./habit-store";
import type { DailyEntry } from "./store";
import type { Habit, HabitLog } from "./habits";

/**
 * Derives a synthetic DailyEntry (the legacy projection input) from the
 * current user's custom habits + today's logs. This is what powers Future /
 * Reality projections so they stay accurate as users customize habits.
 */
function toMinutes(habit: Habit, value: number): number {
  if (habit.unit === "hours") return value * 60;
  if (habit.unit === "minutes") return value;
  return 0;
}

function toHours(habit: Habit, value: number): number {
  if (habit.unit === "hours") return value;
  if (habit.unit === "minutes") return value / 60;
  return 0;
}

export function deriveTodayEntry(
  habits: Habit[],
  logs: Record<string, HabitLog>,
): DailyEntry {
  const today = new Date().toISOString().slice(0, 10);
  const entry: DailyEntry = {
    date: today,
    screen: 0,
    workout: 0,
    reading: 0,
    study: 0,
    sleep: 0,
    deepWork: 0,
  };

  for (const h of habits) {
    const v = logs[h.id]?.value ?? 0;
    if (v <= 0) continue;
    const name = h.name.toLowerCase();

    if (h.icon === "Smartphone" || name.includes("screen") || name.includes("phone")) {
      entry.screen += toHours(h, v);
    } else if (h.icon === "Moon" || name.includes("sleep")) {
      entry.sleep += toHours(h, v);
    } else if (h.icon === "Brain" || name.includes("deep")) {
      entry.deepWork += toMinutes(h, v);
    } else if (h.icon === "BookOpen" || name.includes("read")) {
      entry.reading += toMinutes(h, v);
    } else if (h.icon === "GraduationCap" || name.includes("stud") || name.includes("learn")) {
      entry.study += toMinutes(h, v);
    } else if (
      h.icon === "Dumbbell" ||
      h.icon === "Bike" ||
      h.icon === "Footprints" ||
      h.category === "fitness" ||
      name.includes("workout") ||
      name.includes("run") ||
      name.includes("walk") ||
      name.includes("gym")
    ) {
      entry.workout += toMinutes(h, v);
    }
  }

  // Round for display sanity
  entry.screen = Math.round(entry.screen * 10) / 10;
  entry.sleep = Math.round(entry.sleep * 10) / 10;
  entry.workout = Math.round(entry.workout);
  entry.reading = Math.round(entry.reading);
  entry.study = Math.round(entry.study);
  entry.deepWork = Math.round(entry.deepWork);
  return entry;
}

/** React hook that returns today's derived entry + loading state. */
export function useDerivedToday() {
  const { habits, todayLogs, loading } = useHabits();
  const entry = useMemo(() => deriveTodayEntry(habits, todayLogs), [habits, todayLogs]);
  const hasAnyData = useMemo(
    () =>
      entry.screen > 0 ||
      entry.workout > 0 ||
      entry.reading > 0 ||
      entry.study > 0 ||
      entry.sleep > 0 ||
      entry.deepWork > 0,
    [entry],
  );
  return { entry, loading, hasAnyData, habitsCount: habits.length };
}