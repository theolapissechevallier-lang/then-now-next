import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useAuth } from "./auth-context";
import { useAppState, petStage } from "./store";
import { useGoals } from "./goals-store";
import {
  ACHIEVEMENTS,
  achievementScore,
  evaluateAchievements,
  fetchLifetimeCoinsEarned,
  fetchLifetimeHabitCompletions,
  fetchUnlocked,
  findAchievement,
  persistUnlocks,
  rarestUnlocked,
  RARITY_STYLE,
  type AchievementDef,
  type UnlockedAchievement,
  type UserStats,
} from "./achievements";

type Ctx = {
  unlocked: UnlockedAchievement[];
  loading: boolean;
  stats: UserStats;
  score: number;
  rarest: AchievementDef | null;
  completionPct: number; // 0..100
  refresh: () => Promise<void>;
};

const AchievementsContext = createContext<Ctx | null>(null);

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { state } = useAppState();
  const { goals } = useGoals();
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [lifetimeHabits, setLifetimeHabits] = useState(0);
  const [lifetimeCoins, setLifetimeCoins] = useState(0);
  const checkingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setUnlocked([]);
      setLifetimeHabits(0);
      setLifetimeCoins(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [ach, habitCount, coinsEarned] = await Promise.all([
      fetchUnlocked(user.id),
      fetchLifetimeHabitCompletions(user.id),
      fetchLifetimeCoinsEarned(user.id),
    ]);
    setUnlocked(ach);
    setLifetimeHabits(habitCount);
    setLifetimeCoins(coinsEarned);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const goalsCompleted = useMemo(
    () => goals.filter((g) => g.status === "completed" || g.status === "archived").length,
    [goals],
  );

  const stats = useMemo<UserStats>(
    () => ({
      goalsCompleted,
      currentStreak: state.profile.streak,
      petXp: state.pet.xp,
      petStage: petStage(state.pet.xp).level,
      habitsCompleted: lifetimeHabits,
      coinsTotal: Math.max(state.coins, lifetimeCoins),
    }),
    [
      goalsCompleted,
      state.profile.streak,
      state.pet.xp,
      state.coins,
      lifetimeHabits,
      lifetimeCoins,
    ],
  );

  // Auto-unlock loop. Runs whenever stats change.
  useEffect(() => {
    if (!user || loading || checkingRef.current) return;
    const known = new Set(unlocked.map((u) => u.achievementId));
    const newly = evaluateAchievements(stats, known);
    if (newly.length === 0) return;
    checkingRef.current = true;
    (async () => {
      const inserted = await persistUnlocks(
        user.id,
        newly.map((n) => n.id),
      );
      if (inserted.length > 0) {
        setUnlocked((prev) => {
          const ids = new Set(prev.map((p) => p.achievementId));
          const merged = [...prev];
          for (const row of inserted) if (!ids.has(row.achievementId)) merged.unshift(row);
          return merged;
        });
        for (const row of inserted) {
          const def = findAchievement(row.achievementId);
          if (def) {
            toast.success(`Achievement unlocked: ${def.title}`, {
              description: `${RARITY_STYLE[def.rarity].label} · ${def.description}`,
              duration: 4500,
            });
          }
        }
      }
      checkingRef.current = false;
    })();
  }, [stats, unlocked, loading, user]);

  // Refresh lifetime habit count occasionally — when habits change won't trigger automatically.
  useEffect(() => {
    if (!user) return;
    const handler = () => {
      void fetchLifetimeHabitCompletions(user.id).then(setLifetimeHabits);
      void fetchLifetimeCoinsEarned(user.id).then(setLifetimeCoins);
    };
    const interval = window.setInterval(handler, 60_000);
    window.addEventListener("focus", handler);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handler);
    };
  }, [user]);

  const score = useMemo(() => achievementScore(unlocked), [unlocked]);
  const rarest = useMemo(() => rarestUnlocked(unlocked), [unlocked]);
  const completionPct = useMemo(
    () =>
      ACHIEVEMENTS.length === 0 ? 0 : Math.round((unlocked.length / ACHIEVEMENTS.length) * 100),
    [unlocked],
  );

  return (
    <AchievementsContext.Provider
      value={{ unlocked, loading, stats, score, rarest, completionPct, refresh }}
    >
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const ctx = useContext(AchievementsContext);
  if (!ctx) throw new Error("useAchievements must be used within AchievementsProvider");
  return ctx;
}
