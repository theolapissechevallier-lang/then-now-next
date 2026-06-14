import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./auth-context";
import {
  initializeUser,
  loadUserData,
  saveProfile,
  saveDailyEntry,
  saveAvatar,
  savePet,
  addItem,
  updateCoins,
  updateUserXp,
  saveRewardedDate,
  setPremium,
  migrateLocalData,
} from "./data-sync";

// ---------- Types ----------

export type Goal = "fit" | "muscle" | "skills" | "money" | "read" | "screen" | "mental";

export const GOAL_META: Record<Goal, { label: string; emoji: string }> = {
  fit: { label: "Get fit", emoji: "🏃" },
  muscle: { label: "Build muscle", emoji: "💪" },
  skills: { label: "Learn skills", emoji: "🧠" },
  money: { label: "Make money", emoji: "💸" },
  read: { label: "Read more", emoji: "📚" },
  screen: { label: "Reduce screen time", emoji: "📵" },
  mental: { label: "Mental health", emoji: "🧘" },
};

export type DailyEntry = {
  date: string;
  screen: number;
  workout: number;
  reading: number;
  study: number;
  sleep: number;
  deepWork: number;
  journalGood?: string;
  journalImprove?: string;
};

export type Profile = {
  age: number | null;
  goals: Goal[];
  onboarded: boolean;
  streak: number;
  lastCheckIn: string | null;
};

export type AvatarState = {
  skin: string;
  hair: string;
  outfit: string;
  accessory: string;
  background: string;
};

export type PetState = {
  name: string;
  species: string;
  skin: string;
  accessory: string;
  xp: number;
  storedHappiness: number;
  storedHunger: number;
  lastFed: string | null;
  lastUpdated: string | null;
};

export type AppState = {
  profile: Profile;
  entries: Record<string, DailyEntry>;
  coins: number;
  xp: number;
  avatar: AvatarState;
  pet: PetState;
  inventory: string[];
  rewardedDates: Record<string, number>;
  premium: boolean;
};

export const DEFAULT_AVATAR: AvatarState = {
  skin: "skin-warm",
  hair: "hair-short",
  outfit: "outfit-hoodie",
  accessory: "acc-none",
  background: "bg-aurora",
};

export const DEFAULT_PET: PetState = {
  name: "Nova",
  species: "pet-blob",
  skin: "pet-blob",
  accessory: "pet-acc-none",
  xp: 0,
  storedHappiness: 60,
  storedHunger: 50,
  lastFed: null,
  lastUpdated: null,
};

const KEY = "future-me-state-v2";

const defaultEntry = (date: string): DailyEntry => ({
  date,
  screen: 0,
  workout: 0,
  reading: 0,
  study: 0,
  sleep: 0,
  deepWork: 0,
});

const defaultState: AppState = {
  profile: { age: null, goals: [], onboarded: false, streak: 0, lastCheckIn: null },
  entries: {},
  coins: 50,
  xp: 0,
  avatar: DEFAULT_AVATAR,
  pet: DEFAULT_PET,
  inventory: [
    DEFAULT_AVATAR.skin,
    DEFAULT_AVATAR.hair,
    DEFAULT_AVATAR.outfit,
    DEFAULT_AVATAR.accessory,
    DEFAULT_AVATAR.background,
    DEFAULT_PET.skin,
    DEFAULT_PET.accessory,
  ],
  rewardedDates: {},
  premium: false,
};

// Local storage operations
function readLocal(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      xp: parsed.xp ?? 0,
      avatar: { ...DEFAULT_AVATAR, ...(parsed.avatar ?? {}) },
      pet: { ...DEFAULT_PET, ...(parsed.pet ?? {}) },
      inventory: parsed.inventory ?? defaultState.inventory,
      rewardedDates: parsed.rewardedDates ?? {},
    };
  } catch {
    return defaultState;
  }
}

function writeLocal(state: AppState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("future-me:update"));
}

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

// ---------- Rewards ----------

export function computeDailyCoins(t: DailyEntry): number {
  let c = 0;
  c += Math.floor(t.workout / 15) * 3;
  c += Math.floor(t.reading / 15) * 2;
  c += Math.floor(t.study / 30) * 3;
  c += Math.floor(t.deepWork / 30) * 4;
  if (t.sleep >= 7 && t.sleep <= 9) c += 8;
  if (t.screen > 0 && t.screen <= 2) c += 10;
  return Math.max(0, c);
}

export function streakReward(streak: number): number {
  if (streak === 365) return 1000;
  if (streak === 100) return 300;
  if (streak === 30) return 100;
  if (streak === 7) return 30;
  if (streak % 7 === 0) return 15;
  return 5;
}

// ---------- Pet ----------

export type PetStage = {
  stage: "egg" | "baby" | "teen" | "adult" | "master";
  level: number;
  progress: number;
};

export function petStage(xp: number): PetStage {
  const thresholds = [0, 60, 200, 500, 1200];
  const stages: PetStage["stage"][] = ["egg", "baby", "teen", "adult", "master"];
  let i = 0;
  for (let k = thresholds.length - 1; k >= 0; k--) {
    if (xp >= thresholds[k]!) {
      i = k;
      break;
    }
  }
  const lo = thresholds[i]!;
  const hi = thresholds[i + 1] ?? lo + 1000;
  return {
    stage: stages[i]!,
    level: i + 1,
    progress: Math.min(1, (xp - lo) / (hi - lo)),
  };
}

export type LivePet = PetState & { hunger: number; happiness: number; stage: PetStage };

export function livePet(p: PetState): LivePet {
  const now = Date.now();
  const ref = p.lastUpdated ? Date.parse(p.lastUpdated) : now;
  const hours = Math.max(0, (now - ref) / 36e5);
  const hunger = Math.max(0, p.storedHunger - hours * 4);
  const happiness = Math.max(0, p.storedHappiness - hours * 2 - (hunger < 30 ? hours * 2 : 0));
  return { ...p, hunger, happiness, stage: petStage(p.xp) };
}

// ---------- Hook ----------

export function useAppState() {
  const { user, session, loading: authLoading } = useAuth();
  const [state, setState] = useState<AppState>(defaultState);
  const [dataLoading, setDataLoading] = useState(true);

  // Load data when auth state changes
  useEffect(() => {
    if (authLoading) return;

    if (user && session) {
      // User is logged in - load from Supabase
      (async () => {
        const loadedState = await initializeUser(user);
        if (loadedState) {
          // Check if there's local data to migrate
          const localState = readLocal();
          const hasLocalData =
            localState.profile.onboarded || Object.keys(localState.entries).length > 0;

          if (hasLocalData && !loadedState.profile.onboarded) {
            // Migrate local data to Supabase
            await migrateLocalData(user, localState);
            const migratedState = await loadUserData(user);
            if (migratedState) {
              setState(migratedState);
            }
          } else {
            setState(loadedState);
          }
        } else {
          // Fallback to local
          setState(readLocal());
        }
        setDataLoading(false);
      })();
    } else {
      // No user - use local storage
      setState(readLocal());
      setDataLoading(false);
    }
  }, [user, session, authLoading]);

  // Listen for local storage changes (for multi-tab sync in local mode)
  useEffect(() => {
    const sync = () => {
      if (!user) {
        setState(readLocal());
      }
    };
    window.addEventListener("future-me:update", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("future-me:update", sync);
      window.removeEventListener("storage", sync);
    };
  }, [user]);

  const update = useCallback(
    (mut: (s: AppState) => AppState) => {
      const prev = state;
      const next = mut(prev);
      setState(next);

      // Always write to localStorage as backup
      writeLocal(next);

      // Sync to Supabase if logged in
      if (user && session) {
        // Identify what changed and sync
        // This is a simplified approach - in production, you'd want more granular sync
      }
    },
    [state, user, session],
  );

  const setProfile = useCallback(
    async (p: Partial<Profile>) => {
      const prevProfile = state.profile;
      update((s) => ({ ...s, profile: { ...s.profile, ...p } }));

      if (user) {
        await saveProfile(user, p);
      }
    },
    [update, user, state.profile],
  );

  const setToday = useCallback(
    async (patch: Partial<DailyEntry>) => {
      const key = todayKey();
      const existing = state.entries[key] ?? defaultEntry(key);
      const nextEntry = { ...existing, ...patch };
      const earnable = computeDailyCoins(nextEntry);
      const already = state.rewardedDates[key] ?? 0;
      const delta = Math.max(0, earnable - already);

      update((s) => {
        const next: AppState = {
          ...s,
          entries: { ...s.entries, [key]: nextEntry },
        };
        if (delta > 0) {
          next.coins = s.coins + delta;
          next.rewardedDates = { ...s.rewardedDates, [key]: earnable };
          next.pet = { ...s.pet, xp: s.pet.xp + delta };
        }
        return next;
      });

      if (user) {
        await saveDailyEntry(user, nextEntry);
        if (delta > 0) {
          await updateCoins(user, state.coins + delta);
          await saveRewardedDate(user, key, earnable);
        }
      }
    },
    [update, user, state],
  );

  const checkIn = useCallback(async () => {
    const today = todayKey();
    if (state.profile.lastCheckIn === today) return;

    const yesterday = todayKey(new Date(Date.now() - 86400000));
    const streak = state.profile.lastCheckIn === yesterday ? state.profile.streak + 1 : 1;
    const reward = streakReward(streak);
    const newCoins = state.coins + reward;

    update((s) => ({
      ...s,
      profile: { ...s.profile, streak, lastCheckIn: today },
      coins: newCoins,
    }));

    if (user) {
      await saveProfile(user, { streak, lastCheckIn: today });
      await updateCoins(user, newCoins);
    }
  }, [update, user, state]);

  const setAvatar = useCallback(
    async (patch: Partial<AvatarState>) => {
      update((s) => ({ ...s, avatar: { ...s.avatar, ...patch } }));

      if (user) {
        await saveAvatar(user, patch);
      }
    },
    [update, user],
  );

  const setPet = useCallback(
    async (patch: Partial<PetState>) => {
      update((s) => ({ ...s, pet: { ...s.pet, ...patch } }));

      if (user) {
        await savePet(user, patch);
      }
    },
    [update, user],
  );

  const buyItem = useCallback(
    async (itemId: string, price: number): Promise<{ ok: boolean; reason?: string }> => {
      if (state.inventory.includes(itemId)) {
        return { ok: false, reason: "Already owned" };
      }
      if (state.coins < price) {
        return { ok: false, reason: "Not enough coins" };
      }

      const newCoins = state.coins - price;

      update((s) => ({
        ...s,
        coins: newCoins,
        inventory: [...s.inventory, itemId],
      }));

      if (user) {
        const success = await addItem(user, itemId, price, newCoins);
        if (!success) {
          // Revert on failure
          update((s) => ({
            ...s,
            coins: s.coins + price,
            inventory: s.inventory.filter((id) => id !== itemId),
          }));
          return { ok: false, reason: "Failed to save purchase" };
        }
      }

      return { ok: true };
    },
    [update, user, state],
  );

  const feedPet = useCallback(
    async (food: { id: string; price: number; hunger: number; happy: number; xp: number }) => {
      if (state.coins < food.price) {
        return { ok: false, reason: "Not enough coins" };
      }

      const live = livePet(state.pet);
      const now = new Date().toISOString();
      const newCoins = state.coins - food.price;
      const newXp = state.pet.xp + food.xp;

      update((s) => ({
        ...s,
        coins: newCoins,
        pet: {
          ...s.pet,
          storedHunger: Math.min(100, live.hunger + food.hunger),
          storedHappiness: Math.min(100, live.happiness + food.happy),
          xp: newXp,
          lastFed: now,
          lastUpdated: now,
        },
      }));

      if (user) {
        await updateCoins(user, newCoins);
        await savePet(user, {
          storedHunger: Math.min(100, live.hunger + food.hunger),
          storedHappiness: Math.min(100, live.happiness + food.happy),
          xp: newXp,
          lastFed: now,
          lastUpdated: now,
        });
      }

      return { ok: true };
    },
    [update, user, state],
  );

  const setPremiumStatus = useCallback(
    async (v: boolean) => {
      update((s) => ({ ...s, premium: v }));

      if (user) {
        await setPremium(user, v);
      }
    },
    [update, user],
  );

  const addCoins = useCallback(
    async (amount: number) => {
      const newCoins = state.coins + amount;
      update((s) => ({ ...s, coins: s.coins + amount }));
      if (user) {
        await updateCoins(user, newCoins);
      }
    },
    [update, user, state.coins],
  );

  const addPetXp = useCallback(
    async (amount: number) => {
      if (amount <= 0) return;
      const newXp = state.pet.xp + amount;
      update((s) => ({ ...s, pet: { ...s.pet, xp: s.pet.xp + amount } }));
      if (user) {
        await savePet(user, { xp: newXp });
      }
    },
    [update, user, state.pet.xp],
  );

  const addUserXp = useCallback(
    async (amount: number) => {
      if (amount <= 0) return;
      const newXp = state.xp + amount;
      update((s) => ({ ...s, xp: s.xp + amount }));
      if (user) {
        await updateUserXp(user, newXp);
      }
    },
    [update, user, state.xp],
  );

  const reset = useCallback(() => {
    writeLocal(defaultState);
    setState(defaultState);
  }, []);

  const loading = authLoading || dataLoading;
  const todayEntry = state.entries[todayKey()] ?? defaultEntry(todayKey());

  return {
    state,
    today: todayEntry,
    pet: livePet(state.pet),
    setProfile,
    setToday,
    checkIn,
    setAvatar,
    setPet,
    buyItem,
    feedPet,
    setPremium: setPremiumStatus,
    addCoins,
    addPetXp,
    addUserXp,
    reset,
    loading,
    isLoggedIn: !!user,
  };
}

// ---------- Projection engine ----------

export type Projection = {
  screenHoursLost: number;
  workoutsEquivalent: number;
  booksEquivalent: number;
  languagesEquivalent: number;
  moneyEquivalent: number;
  workoutsCompleted: number;
  booksRead: number;
  studyHours: number;
};

export function project(today: DailyEntry, days: number): Projection {
  const screenHoursLost = today.screen * days;
  const workoutsEquivalent = Math.floor((screenHoursLost * 60) / 45);
  const booksEquivalent = Math.floor(screenHoursLost / 6);
  const languagesEquivalent = +(screenHoursLost / 600).toFixed(1);
  const moneyEquivalent = Math.round(screenHoursLost * 30);
  const workoutsCompleted = Math.floor((today.workout / 45) * days);
  const booksRead = Math.floor(((today.reading / 60) * days) / 6);
  const studyHours = Math.round((today.study / 60) * days);
  return {
    screenHoursLost: Math.round(screenHoursLost),
    workoutsEquivalent,
    booksEquivalent,
    languagesEquivalent,
    moneyEquivalent,
    workoutsCompleted,
    booksRead,
    studyHours,
  };
}

export function scoreToday(t: DailyEntry) {
  const productive =
    Math.min(
      1,
      (t.workout / 45) * 0.25 +
        (t.reading / 30) * 0.2 +
        (t.study / 90) * 0.25 +
        (t.deepWork / 120) * 0.3,
    ) * 100;
  const screenPenalty = Math.min(1, Math.max(0, (t.screen - 2) / 6)) * 100;
  const sleepBonus = Math.min(1, t.sleep / 8) * 100;
  const discipline = Math.round(productive * 0.6 + sleepBonus * 0.2 + (100 - screenPenalty) * 0.2);
  const growth = Math.round(productive * 0.7 + sleepBonus * 0.3);
  const futureScore = Math.round((discipline + growth) / 2);
  return {
    productive: Math.round(productive),
    screenPenalty: Math.round(screenPenalty),
    discipline,
    growth,
    futureScore,
  };
}
