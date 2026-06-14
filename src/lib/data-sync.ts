import type { User } from "@supabase/supabase-js";
import { supabase, isSupabaseAvailable } from "./supabase";
import type { AppState, DailyEntry, AvatarState, PetState, Profile } from "./store";
import type { Habit, HabitLog } from "./habits";
import { DEFAULT_HABITS } from "./habits";

export type DbProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  age: number | null;
  goals: string[];
  onboarded: boolean;
  streak: number;
  last_check_in: string | null;
  coins: number;
  xp: number;
  premium: boolean;
  created_at: string;
  updated_at: string;
};

export type DbDailyEntry = {
  id: string;
  user_id: string;
  date: string;
  screen_hours: number;
  workout_minutes: number;
  reading_minutes: number;
  study_minutes: number;
  deep_work_minutes: number;
  sleep_hours: number;
  journal_good: string | null;
  journal_improve: string | null;
  created_at: string;
  updated_at: string;
};

export type DbAvatar = {
  id: string;
  user_id: string;
  skin: string;
  hair: string;
  outfit: string;
  accessory: string;
  background: string;
  created_at: string;
  updated_at: string;
};

export type DbPet = {
  id: string;
  user_id: string;
  name: string;
  species: string;
  skin: string;
  accessory: string;
  xp: number;
  stored_happiness: number;
  stored_hunger: number;
  last_fed: string | null;
  last_updated: string | null;
  created_at: string;
  updated_at: string;
};

export type DbUserItem = {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  purchased_at: string;
};

export type DbRewardedDate = {
  id: string;
  user_id: string;
  date: string;
  coins_earned: number;
  created_at: string;
};

export type DbUserHabit = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  category: string;
  color: string;
  difficulty: string;
  reward_per_unit: number;
  xp_per_unit: number;
  unit: string;
  target_per_day: number;
  is_active: boolean;
  sort_order: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type DbHabitLog = {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  value: number;
  coins_earned: number;
  xp_earned: number;
  created_at: string;
  updated_at: string;
};

export async function initializeUser(user: User): Promise<AppState | null> {
  if (!supabase) return null;

  const userId = user.id;

  // Check if profile exists
  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Error checking profile:", profileError);
    return null;
  }

  if (existingProfile) {
    // Load existing data
    return loadUserData(user);
  }

  // Create new user records
  const email = user.email ?? "";

  const { error: insertProfileError } = await supabase.from("profiles").insert({
    id: userId,
    email,
    age: null,
    goals: [],
    onboarded: false,
    streak: 0,
    last_check_in: null,
    coins: 50,
    premium: false,
  });

  if (insertProfileError) {
    console.error("Error creating profile:", insertProfileError);
    return null;
  }

  const { error: insertAvatarError } = await supabase.from("avatars").insert({
    user_id: userId,
    skin: "skin-warm",
    hair: "hair-short",
    outfit: "outfit-hoodie",
    accessory: "acc-none",
    background: "bg-aurora",
  });

  if (insertAvatarError) {
    console.error("Error creating avatar:", insertAvatarError);
  }

  const { error: insertPetError } = await supabase.from("pets").insert({
    user_id: userId,
    name: "Nova",
    species: "pet-blob",
    skin: "pet-blob",
    accessory: "pet-acc-none",
    xp: 0,
    stored_happiness: 60,
    stored_hunger: 50,
    last_fed: null,
    last_updated: null,
  });

  if (insertPetError) {
    console.error("Error creating pet:", insertPetError);
  }

  // Insert default inventory items
  const defaultItems = [
    "skin-warm",
    "hair-short",
    "outfit-hoodie",
    "acc-none",
    "bg-aurora",
    "pet-blob",
    "pet-acc-none",
  ];

  const { error: insertItemsError } = await supabase.from("user_items").insert(
    defaultItems.map((item_id) => ({
      user_id: userId,
      item_id,
      quantity: 1,
    })),
  );

  if (insertItemsError) {
    console.error("Error creating inventory:", insertItemsError);
  }

  // Return default state
  return loadUserData(user);
}

export async function loadUserData(user: User): Promise<AppState | null> {
  if (!supabase) return null;

  const userId = user.id;

  // Load all data in parallel
  const [profileResult, entriesResult, avatarResult, petResult, itemsResult, rewardedResult] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("daily_entries").select("*").eq("user_id", userId),
      supabase.from("avatars").select("*").eq("user_id", userId).single(),
      supabase.from("pets").select("*").eq("user_id", userId).single(),
      supabase.from("user_items").select("*").eq("user_id", userId),
      supabase.from("rewarded_dates").select("*").eq("user_id", userId),
    ]);

  // Check for errors
  if (profileResult.error) {
    console.error("Error loading profile:", profileResult.error);
    return null;
  }

  if (avatarResult.error && avatarResult.error.code !== "PGRST116") {
    console.error("Error loading avatar:", avatarResult.error);
  }

  if (petResult.error && petResult.error.code !== "PGRST116") {
    console.error("Error loading pet:", petResult.error);
  }

  const profile = profileResult.data as DbProfile;
  const entries = (entriesResult.data as DbDailyEntry[] | null) ?? [];
  const avatar = avatarResult.data as DbAvatar | null;
  const pet = petResult.data as DbPet | null;
  const items = (itemsResult.data as DbUserItem[] | null) ?? [];
  const rewarded = (rewardedResult.data as DbRewardedDate[] | null) ?? [];

  // Transform to AppState
  const entriesMap: Record<string, DailyEntry> = {};
  for (const e of entries) {
    entriesMap[e.date] = {
      date: e.date,
      screen: e.screen_hours,
      workout: e.workout_minutes,
      reading: e.reading_minutes,
      study: e.study_minutes,
      deepWork: e.deep_work_minutes,
      sleep: e.sleep_hours,
      journalGood: e.journal_good ?? undefined,
      journalImprove: e.journal_improve ?? undefined,
    };
  }

  const rewardedMap: Record<string, number> = {};
  for (const r of rewarded) {
    rewardedMap[r.date] = r.coins_earned;
  }

  const inventory = items.map((i) => i.item_id);

  const appState: AppState = {
    profile: {
      age: profile.age,
      goals: profile.goals as Profile["goals"],
      onboarded: profile.onboarded,
      streak: profile.streak,
      lastCheckIn: profile.last_check_in,
    },
    entries: entriesMap,
    coins: profile.coins,
    xp: profile.xp ?? 0,
    avatar: avatar
      ? {
          skin: avatar.skin,
          hair: avatar.hair,
          outfit: avatar.outfit,
          accessory: avatar.accessory,
          background: avatar.background,
        }
      : {
          skin: "skin-warm",
          hair: "hair-short",
          outfit: "outfit-hoodie",
          accessory: "acc-none",
          background: "bg-aurora",
        },
    pet: pet
      ? {
          name: pet.name,
          species: pet.species,
          skin: pet.skin,
          accessory: pet.accessory,
          xp: pet.xp,
          storedHappiness: pet.stored_happiness,
          storedHunger: pet.stored_hunger,
          lastFed: pet.last_fed,
          lastUpdated: pet.last_updated,
        }
      : {
          name: "Nova",
          species: "pet-blob",
          skin: "pet-blob",
          accessory: "pet-acc-none",
          xp: 0,
          storedHappiness: 60,
          storedHunger: 50,
          lastFed: null,
          lastUpdated: null,
        },
    inventory,
    rewardedDates: rewardedMap,
    premium: profile.premium,
  };

  return appState;
}

export async function saveProfile(user: User, profile: Partial<Profile>): Promise<boolean> {
  if (!supabase) return false;

  const updateData: Record<string, unknown> = {};

  if (profile.age !== undefined) updateData.age = profile.age;
  if (profile.goals !== undefined) updateData.goals = profile.goals;
  if (profile.onboarded !== undefined) updateData.onboarded = profile.onboarded;
  if (profile.streak !== undefined) updateData.streak = profile.streak;
  if (profile.lastCheckIn !== undefined) updateData.last_check_in = profile.lastCheckIn;

  const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id);

  if (error) {
    console.error("Error saving profile:", error);
    return false;
  }

  return true;
}

export async function saveDailyEntry(user: User, entry: DailyEntry): Promise<boolean> {
  if (!supabase) return false;

  const data = {
    user_id: user.id,
    date: entry.date,
    screen_hours: entry.screen,
    workout_minutes: entry.workout,
    reading_minutes: entry.reading,
    study_minutes: entry.study,
    deep_work_minutes: entry.deepWork,
    sleep_hours: entry.sleep,
    journal_good: entry.journalGood ?? null,
    journal_improve: entry.journalImprove ?? null,
  };

  const { error } = await supabase
    .from("daily_entries")
    .upsert(data, { onConflict: "user_id,date" });

  if (error) {
    console.error("Error saving daily entry:", error);
    return false;
  }

  return true;
}

export async function saveAvatar(user: User, avatar: Partial<AvatarState>): Promise<boolean> {
  if (!supabase) return false;

  const updateData: Record<string, unknown> = {};

  if (avatar.skin !== undefined) updateData.skin = avatar.skin;
  if (avatar.hair !== undefined) updateData.hair = avatar.hair;
  if (avatar.outfit !== undefined) updateData.outfit = avatar.outfit;
  if (avatar.accessory !== undefined) updateData.accessory = avatar.accessory;
  if (avatar.background !== undefined) updateData.background = avatar.background;

  const { error } = await supabase.from("avatars").update(updateData).eq("user_id", user.id);

  if (error) {
    console.error("Error saving avatar:", error);
    return false;
  }

  return true;
}

export async function savePet(user: User, pet: Partial<PetState>): Promise<boolean> {
  if (!supabase) return false;

  const updateData: Record<string, unknown> = {};

  if (pet.name !== undefined) updateData.name = pet.name;
  if (pet.species !== undefined) updateData.species = pet.species;
  if (pet.skin !== undefined) updateData.skin = pet.skin;
  if (pet.accessory !== undefined) updateData.accessory = pet.accessory;
  if (pet.xp !== undefined) updateData.xp = pet.xp;
  if (pet.storedHappiness !== undefined) updateData.stored_happiness = pet.storedHappiness;
  if (pet.storedHunger !== undefined) updateData.stored_hunger = pet.storedHunger;
  if (pet.lastFed !== undefined) updateData.last_fed = pet.lastFed;
  if (pet.lastUpdated !== undefined) updateData.last_updated = pet.lastUpdated;

  const { error } = await supabase.from("pets").update(updateData).eq("user_id", user.id);

  if (error) {
    console.error("Error saving pet:", error);
    return false;
  }

  return true;
}

export async function addItem(
  user: User,
  itemId: string,
  price: number,
  newCoins: number,
): Promise<boolean> {
  if (!supabase) return false;

  // Use transaction-like approach: first deduct coins, then add item
  const { error: coinsError } = await supabase
    .from("profiles")
    .update({ coins: newCoins })
    .eq("id", user.id);

  if (coinsError) {
    console.error("Error deducting coins:", coinsError);
    return false;
  }

  // Check if item already exists
  const { data: existingItem, error: checkError } = await supabase
    .from("user_items")
    .select("*")
    .eq("user_id", user.id)
    .eq("item_id", itemId)
    .maybeSingle();

  if (checkError) {
    console.error("Error checking item:", checkError);
    return false;
  }

  if (existingItem) {
    // Increment quantity
    const { error: updateError } = await supabase
      .from("user_items")
      .update({ quantity: (existingItem as DbUserItem).quantity + 1 })
      .eq("id", (existingItem as DbUserItem).id);

    if (updateError) {
      console.error("Error updating item quantity:", updateError);
      return false;
    }
  } else {
    // Insert new item
    const { error: insertError } = await supabase.from("user_items").insert({
      user_id: user.id,
      item_id: itemId,
      quantity: 1,
    });

    if (insertError) {
      console.error("Error inserting item:", insertError);
      return false;
    }
  }

  return true;
}

export async function updateCoins(user: User, coins: number): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from("profiles").update({ coins }).eq("id", user.id);

  if (error) {
    console.error("Error updating coins:", error);
    return false;
  }

  return true;
}

export async function updateUserXp(user: User, xp: number): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("profiles").update({ xp }).eq("id", user.id);
  if (error) {
    console.error("Error updating user xp:", error);
    return false;
  }
  return true;
}

export async function saveRewardedDate(
  user: User,
  date: string,
  coinsEarned: number,
): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from("rewarded_dates")
    .upsert({ user_id: user.id, date, coins_earned: coinsEarned }, { onConflict: "user_id,date" });

  if (error) {
    console.error("Error saving rewarded date:", error);
    return false;
  }

  return true;
}

export async function setPremium(user: User, premium: boolean): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from("profiles").update({ premium }).eq("id", user.id);

  if (error) {
    console.error("Error setting premium:", error);
    return false;
  }

  return true;
}

export async function migrateLocalData(user: User, localState: AppState): Promise<boolean> {
  if (!supabase) return false;

  // Migrate profile
  await saveProfile(user, localState.profile);
  await updateCoins(user, localState.coins);

  // Set premium
  if (localState.premium) {
    await setPremium(user, true);
  }

  // Migrate avatar
  await saveAvatar(user, localState.avatar);

  // Migrate pet
  await savePet(user, localState.pet);

  // Migrate daily entries
  for (const [date, entry] of Object.entries(localState.entries)) {
    await saveDailyEntry(user, entry);
  }

  // Migrate rewarded dates
  for (const [date, coins] of Object.entries(localState.rewardedDates)) {
    await saveRewardedDate(user, date, coins);
  }

  // Migrate inventory (add items that don't exist)
  const { data: existingItems } = await supabase
    .from("user_items")
    .select("item_id")
    .eq("user_id", user.id);

  const existingItemIds = new Set(
    (existingItems as DbUserItem[] | null)?.map((i) => i.item_id) ?? [],
  );

  const newItems = localState.inventory.filter((id) => !existingItemIds.has(id));
  if (newItems.length > 0) {
    await supabase.from("user_items").insert(
      newItems.map((item_id) => ({
        user_id: user.id,
        item_id,
        quantity: 1,
      })),
    );
  }

  return true;
}

// ---------- Habit functions ----------

export async function loadUserHabits(user: User): Promise<Habit[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("user_habits")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error loading habits:", error);
    return [];
  }

  return (data as DbUserHabit[]).map((h) => ({
    id: h.id,
    userId: h.user_id,
    name: h.name,
    icon: h.icon as Habit["icon"],
    category: h.category as Habit["category"],
    color: h.color as Habit["color"],
    difficulty: h.difficulty as Habit["difficulty"],
    rewardPerUnit: h.reward_per_unit,
    xpPerUnit: h.xp_per_unit ?? 0,
    unit: h.unit,
    targetPerDay: h.target_per_day,
    isActive: h.is_active,
    sortOrder: h.sort_order,
    isDefault: h.is_default,
    createdAt: h.created_at,
    updatedAt: h.updated_at,
  }));
}

export async function loadHabitLogs(user: User, date: string): Promise<HabitLog[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", date);

  if (error) {
    console.error("Error loading habit logs:", error);
    return [];
  }

  return (data as DbHabitLog[]).map((l) => ({
    id: l.id,
    habitId: l.habit_id,
    date: l.date,
    value: l.value,
    coinsEarned: l.coins_earned,
    xpEarned: l.xp_earned ?? 0,
  }));
}

export async function createDefaultHabits(user: User): Promise<Habit[]> {
  if (!supabase) return [];

  const habitsToInsert = DEFAULT_HABITS.map((h, index) => ({
    user_id: user.id,
    name: h.name,
    icon: h.icon,
    category: h.category,
    color: h.color,
    difficulty: h.difficulty,
    reward_per_unit: h.rewardPerUnit,
    xp_per_unit: h.xpPerUnit,
    unit: h.unit,
    target_per_day: h.targetPerDay,
    is_active: h.isActive,
    sort_order: index,
    is_default: true,
  }));

  const { data, error } = await supabase.from("user_habits").insert(habitsToInsert).select();

  if (error) {
    console.error("Error creating default habits:", error);
    return [];
  }

  return (data as DbUserHabit[]).map((h, index) => ({
    id: h.id,
    userId: h.user_id,
    name: h.name,
    icon: h.icon as Habit["icon"],
    category: h.category as Habit["category"],
    color: h.color as Habit["color"],
    difficulty: h.difficulty as Habit["difficulty"],
    rewardPerUnit: h.reward_per_unit,
    xpPerUnit: h.xp_per_unit ?? 0,
    unit: h.unit,
    targetPerDay: h.target_per_day,
    isActive: h.is_active,
    sortOrder: h.sort_order,
    isDefault: h.is_default,
    createdAt: h.created_at,
    updatedAt: h.updated_at,
  }));
}

export async function createHabit(
  user: User,
  habit: Omit<Habit, "id" | "userId">,
): Promise<Habit | null> {
  if (!supabase) return null;

  // Get max sort order
  const { data: existingHabits } = await supabase
    .from("user_habits")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const maxSortOrder = existingHabits?.[0]?.sort_order ?? -1;

  const { data, error } = await supabase
    .from("user_habits")
    .insert({
      user_id: user.id,
      name: habit.name,
      icon: habit.icon,
      category: habit.category,
      color: habit.color,
      difficulty: habit.difficulty,
      reward_per_unit: habit.rewardPerUnit,
      xp_per_unit: habit.xpPerUnit,
      unit: habit.unit,
      target_per_day: habit.targetPerDay,
      is_active: habit.isActive,
      sort_order: maxSortOrder + 1,
      is_default: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating habit:", error);
    return null;
  }

  const h = data as DbUserHabit;
  return {
    id: h.id,
    userId: h.user_id,
    name: h.name,
    icon: h.icon as Habit["icon"],
    category: h.category as Habit["category"],
    color: h.color as Habit["color"],
    difficulty: h.difficulty as Habit["difficulty"],
    rewardPerUnit: h.reward_per_unit,
    xpPerUnit: h.xp_per_unit ?? 0,
    unit: h.unit,
    targetPerDay: h.target_per_day,
    isActive: h.is_active,
    sortOrder: h.sort_order,
    isDefault: h.is_default,
    createdAt: h.created_at,
    updatedAt: h.updated_at,
  };
}

export async function updateHabit(
  user: User,
  habitId: string,
  updates: Partial<Habit>,
): Promise<boolean> {
  if (!supabase) return false;

  const updateData: Record<string, unknown> = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.icon !== undefined) updateData.icon = updates.icon;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.color !== undefined) updateData.color = updates.color;
  if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty;
  if (updates.rewardPerUnit !== undefined) updateData.reward_per_unit = updates.rewardPerUnit;
  if (updates.xpPerUnit !== undefined) updateData.xp_per_unit = updates.xpPerUnit;
  if (updates.unit !== undefined) updateData.unit = updates.unit;
  if (updates.targetPerDay !== undefined) updateData.target_per_day = updates.targetPerDay;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
  if (updates.sortOrder !== undefined) updateData.sort_order = updates.sortOrder;

  const { error } = await supabase
    .from("user_habits")
    .update(updateData)
    .eq("id", habitId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating habit:", error);
    return false;
  }

  return true;
}

export async function deleteHabit(user: User, habitId: string): Promise<boolean> {
  if (!supabase) return false;

  // Soft delete by setting is_active to false
  const { error } = await supabase
    .from("user_habits")
    .update({ is_active: false })
    .eq("id", habitId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting habit:", error);
    return false;
  }

  return true;
}

export async function saveHabitLog(
  user: User,
  habitId: string,
  date: string,
  value: number,
  coinsEarned: number,
  xpEarned: number = 0,
): Promise<HabitLog | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("habit_logs")
    .upsert(
      {
        user_id: user.id,
        habit_id: habitId,
        date,
        value,
        coins_earned: coinsEarned,
        xp_earned: xpEarned,
      },
      { onConflict: "user_id,habit_id,date" },
    )
    .select()
    .single();

  if (error) {
    console.error("Error saving habit log:", error);
    return null;
  }

  const l = data as DbHabitLog;
  return {
    id: l.id,
    habitId: l.habit_id,
    date: l.date,
    value: l.value,
    coinsEarned: l.coins_earned,
    xpEarned: l.xp_earned ?? 0,
  };
}

export async function getTotalCoinsForDate(user: User, date: string): Promise<number> {
  if (!supabase) return 0;

  const { data, error } = await supabase
    .from("habit_logs")
    .select("coins_earned")
    .eq("user_id", user.id)
    .eq("date", date);

  if (error) {
    console.error("Error getting total coins:", error);
    return 0;
  }

  return (data as DbHabitLog[]).reduce((sum, log) => sum + log.coins_earned, 0);
}

export async function reorderHabits(user: User, habitIds: string[]): Promise<boolean> {
  if (!supabase) return false;

  // Update sort order for each habit
  const updates = habitIds.map((id, index) => ({
    id,
    sort_order: index,
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from("user_habits")
      .update({ sort_order: update.sort_order })
      .eq("id", update.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error reordering habits:", error);
      return false;
    }
  }

  return true;
}
