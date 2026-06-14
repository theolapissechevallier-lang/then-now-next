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
import {
  loadGuestGoals,
  createGuestGoal,
  updateGuestGoal,
  deleteGuestGoal,
} from "./guest-store";

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
    setLoading(true);
    if (!user) {
      setGoals(loadGuestGoals());
      setLoading(false);
      return;
    }
    const list = await fetchGoals(user.id);
    setGoals(list);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createGoal = useCallback(
    async (input: GoalInput) => {
      if (!user) {
        const g = createGuestGoal(input);
        setGoals((prev) => [g, ...prev]);
        return g;
      }
      const g = await dbCreateGoal(user.id, input);
      if (g) setGoals((prev) => [g, ...prev]);
      return g;
    },
    [user],
  );

  const applyLocalPatch = useCallback(
    (id: string, patch: Partial<GoalInput> & { currentValue?: number; status?: GoalStatus; completedAt?: string | null }) => {
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
                currentValue: patch.currentValue ?? g.currentValue,
                unit: patch.unit ?? g.unit,
                deadline: patch.deadline ?? g.deadline,
                rewardCoins: patch.rewardCoins ?? g.rewardCoins,
                rewardXp: patch.rewardXp ?? g.rewardXp,
                rewardItem: patch.rewardItem ?? g.rewardItem,
                status: patch.status ?? g.status,
                completedAt: patch.completedAt ?? g.completedAt,
              }
            : g,
        ),
      );
    },
    [],
  );

  const updateGoal = useCallback(
    async (id: string, patch: Partial<GoalInput>) => {
      if (!user) {
        const ok = updateGuestGoal(id, patch);
        if (ok) applyLocalPatch(id, patch);
        return ok;
      }
      const ok = await dbUpdateGoal(id, patch);
      if (ok) applyLocalPatch(id, patch);
      return ok;
    },
    [user, applyLocalPatch],
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      if (!user) {
        const ok = deleteGuestGoal(id);
        if (ok) setGoals((prev) => prev.filter((g) => g.id !== id));
        return ok;
      }
      const ok = await dbDeleteGoal(id);
      if (ok) setGoals((prev) => prev.filter((g) => g.id !== id));
      return ok;
    },
    [user],
  );

  const setProgress = useCallback(
    async (id: string, value: number) => {
      const v = Math.max(0, value);
      if (!user) {
        const ok = updateGuestGoal(id, { currentValue: v });
        if (ok) {
          setGoals((prev) =>
            prev.map((g) => (g.id === id ? { ...g, currentValue: v } : g)),
          );
        }
        return ok;
      }
      const ok = await dbUpdateGoal(id, { currentValue: v });
      if (ok) {
        setGoals((prev) =>
          prev.map((g) => (g.id === id ? { ...g, currentValue: v } : g)),
        );
      }
      return ok;
    },
    [user],
  );

  const completeGoal = useCallback(
    async (id: string) => {
      const g = goals.find((x) => x.id === id);
      if (!g) return { ok: false, coins: 0, xp: 0 };
      if (g.status !== "active") return { ok: false, coins: 0, xp: 0 };
      if (!isGoalComplete(g)) return { ok: false, coins: 0, xp: 0 };
      const now = new Date().toISOString();
      const patch = {
        status: "completed" as GoalStatus,
        completedAt: now,
        currentValue: g.targetValue,
      };
      const ok = user ? await dbUpdateGoal(id, patch) : updateGuestGoal(id, patch);
      if (ok) {
        setGoals((prev) =>
          prev.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        );
      }
      return { ok, coins: ok ? g.rewardCoins : 0, xp: ok ? g.rewardXp : 0 };
    },
    [goals, user],
  );

  const archiveGoal = useCallback(
    async (id: string) => {
      const patch = { status: "archived" as GoalStatus };
      const ok = user ? await dbUpdateGoal(id, patch) : updateGuestGoal(id, patch);
      if (ok) {
        setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, status: "archived" } : g)));
      }
      return ok;
    },
    [user],
  );

  const restoreGoal = useCallback(
    async (id: string) => {
      const patch = { status: "active" as GoalStatus, completedAt: null };
      const ok = user ? await dbUpdateGoal(id, patch) : updateGuestGoal(id, patch);
      if (ok) {
        setGoals((prev) =>
          prev.map((g) => (g.id === id ? { ...g, status: "active", completedAt: null } : g)),
        );
      }
      return ok;
    },
    [user],
  );

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
