import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./auth-context";
import {
  createGoal as dbCreateGoal,
  deleteGoal as dbDeleteGoal,
  fetchGoals,
  updateGoal as dbUpdateGoal,
  isGoalComplete,
  type Goal,
  type GoalInput,
  type GoalStatus,
} from "./goals";

type Ctx = {
  goals: Goal[];
  loading: boolean;
  refresh: () => Promise<void>;
  createGoal: (input: GoalInput) => Promise<Goal | null>;
  updateGoal: (id: string, patch: Partial<GoalInput>) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<boolean>;
  setProgress: (id: string, value: number) => Promise<boolean>;
  completeGoal: (id: string) => Promise<{ ok: boolean; coins: number; xp: number }>;
  archiveGoal: (id: string) => Promise<boolean>;
  restoreGoal: (id: string) => Promise<boolean>;
};

const GoalContext = createContext<Ctx | null>(null);

export function GoalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const list = await fetchGoals(user.id);
    setGoals(list);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createGoal = useCallback(
    async (input: GoalInput) => {
      if (!user) return null;
      const g = await dbCreateGoal(user.id, input);
      if (g) setGoals((prev) => [g, ...prev]);
      return g;
    },
    [user],
  );

  const updateGoal = useCallback(async (id: string, patch: Partial<GoalInput>) => {
    const ok = await dbUpdateGoal(id, patch);
    if (ok) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                title: patch.title ?? g.title,
                description: patch.description ?? g.description,
                category: patch.category ?? g.category,
                icon: patch.icon ?? g.icon,
                color: patch.color ?? g.color,
                goalType: patch.goalType ?? g.goalType,
                difficulty: patch.difficulty ?? g.difficulty,
                targetValue: patch.targetValue ?? g.targetValue,
                unit: patch.unit ?? g.unit,
                deadline: patch.deadline ?? g.deadline,
                rewardCoins: patch.rewardCoins ?? g.rewardCoins,
                rewardXp: patch.rewardXp ?? g.rewardXp,
                rewardItem: patch.rewardItem ?? g.rewardItem,
              }
            : g,
        ),
      );
    }
    return ok;
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    const ok = await dbDeleteGoal(id);
    if (ok) setGoals((prev) => prev.filter((g) => g.id !== id));
    return ok;
  }, []);

  const setProgress = useCallback(async (id: string, value: number) => {
    const ok = await dbUpdateGoal(id, { currentValue: Math.max(0, value) });
    if (ok) {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, currentValue: Math.max(0, value) } : g)),
      );
    }
    return ok;
  }, []);

  const completeGoal = useCallback(
    async (id: string) => {
      const g = goals.find((x) => x.id === id);
      if (!g) return { ok: false, coins: 0, xp: 0 };
      if (g.status !== "active") return { ok: false, coins: 0, xp: 0 };
      // Validate completion criteria. Simple goals are always validatable.
      if (!isGoalComplete(g)) return { ok: false, coins: 0, xp: 0 };
      const now = new Date().toISOString();
      const ok = await dbUpdateGoal(id, {
        status: "completed" as GoalStatus,
        completedAt: now,
        currentValue: g.targetValue,
      });
      if (ok) {
        setGoals((prev) =>
          prev.map((x) =>
            x.id === id
              ? { ...x, status: "completed", completedAt: now, currentValue: g.targetValue }
              : x,
          ),
        );
      }
      return { ok, coins: ok ? g.rewardCoins : 0, xp: ok ? g.rewardXp : 0 };
    },
    [goals],
  );

  const archiveGoal = useCallback(async (id: string) => {
    const ok = await dbUpdateGoal(id, { status: "archived" as GoalStatus });
    if (ok) {
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, status: "archived" } : g)));
    }
    return ok;
  }, []);

  const restoreGoal = useCallback(async (id: string) => {
    const ok = await dbUpdateGoal(id, { status: "active" as GoalStatus, completedAt: null });
    if (ok) {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status: "active", completedAt: null } : g)),
      );
    }
    return ok;
  }, []);

  return (
    <GoalContext.Provider
      value={{
        goals,
        loading,
        refresh,
        createGoal,
        updateGoal,
        deleteGoal,
        setProgress,
        completeGoal,
        archiveGoal,
        restoreGoal,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
}

export function useGoals() {
  const ctx = useContext(GoalContext);
  if (!ctx) throw new Error("useGoals must be used within GoalProvider");
  return ctx;
}
