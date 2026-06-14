import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useAuth } from "./auth-context";
import { supabase } from "./supabase";
import {
  type PetState,
  type LivePet,
  type FoodItem,
  type OwnedFood,
  type PetSpecies,
  createLivePet,
  getPetLevel,
  getLevelProgress,
  getPetStage,
  DEFAULT_FOODS,
  DEFAULT_PET_SPECIES,
  XP_REWARDS,
} from "./pet-types";
import { useHabits } from "./habit-store";
import { toast } from "sonner";

type PetStateType = {
  pet: LivePet | null;
  species: PetSpecies[];
  foods: FoodItem[];
  ownedFoods: OwnedFood[];
  loading: boolean;
  hasPet: boolean;
  error: string | null;
};

type PetActions = {
  createPet: (name: string, speciesId: string) => Promise<boolean>;
  feedPet: (foodId: string) => Promise<boolean>;
  buyFood: (foodId: string) => Promise<boolean>;
  renamePet: (name: string) => Promise<boolean>;
  refreshPet: () => Promise<void>;
  addXP: (amount: number, reason?: string) => Promise<void>;
  getXPReward: () => number;
};

const PetContext = createContext<(PetStateType & PetActions) | null>(null);

export function PetProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { getTodaysCoins } = useHabits();
  const [pet, setPet] = useState<LivePet | null>(null);
  const [rawPet, setRawPet] = useState<PetState | null>(null);
  const [species] = useState<PetSpecies[]>(DEFAULT_PET_SPECIES);
  const [foods] = useState<FoodItem[]>(DEFAULT_FOODS);
  const [ownedFoods, setOwnedFoods] = useState<OwnedFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPet, setHasPet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPet = useCallback(async () => {
    setError(null);

    if (!user) {
      // Local mode
      const localPet = loadLocalPet();
      if (localPet) {
        setRawPet(localPet);
        setPet(createLivePet(localPet));
        setHasPet(true);
      }
      const localFoods = loadLocalFoods();
      setOwnedFoods(localFoods);
      setLoading(false);
      return;
    }

    try {
      // Load pet from database
      const { data: petData, error: petError } = await supabase!
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (petError) {
        console.error('Error loading pet:', petError);
        setError('Failed to load pet data');
        setLoading(false);
        return;
      }

      if (petData) {
        const petState: PetState = {
          id: petData.id,
          name: petData.name,
          species: petData.species,
          skin: petData.skin,
          accessory: petData.accessory,
          xp: petData.xp ?? 0,
          level: petData.level ?? getPetLevel(petData.xp ?? 0),
          storedHappiness: petData.stored_happiness ?? 50,
          storedHunger: petData.stored_hunger ?? 50,
          storedEnergy: petData.stored_energy ?? 60,
          lastFed: petData.last_fed,
          lastUpdated: petData.last_updated,
        };
        setRawPet(petState);
        setPet(createLivePet(petState));
        setHasPet(true);
      } else {
        setHasPet(false);
        setPet(null);
        setRawPet(null);
      }

      // Load owned foods
      const { data: foodsData, error: foodsError } = await supabase!
        .from('user_foods')
        .select('*')
        .eq('user_id', user.id);

      if (foodsError) {
        console.error('Error loading foods:', foodsError);
      } else if (foodsData) {
        const owned: OwnedFood[] = foodsData
          .map((f: { food_id: string; quantity: number }) => {
            const foodDef = DEFAULT_FOODS.find(food => food.id === f.food_id);
            if (!foodDef) return null;
            return {
              ...foodDef,
              quantity: f.quantity,
            };
          })
          .filter((f): f is OwnedFood => f !== null);
        setOwnedFoods(owned);
      }
    } catch (err) {
      console.error('Unexpected error loading pet:', err);
      setError('An unexpected error occurred');
    }

    setLoading(false);
  }, [user]);

  // Update live stats periodically
  useEffect(() => {
    if (!rawPet) return;

    const updateLiveStats = () => {
      setPet(createLivePet(rawPet));
    };

    // Update every minute
    const interval = setInterval(updateLiveStats, 60000);
    return () => clearInterval(interval);
  }, [rawPet]);

  useEffect(() => {
    refreshPet();
  }, [refreshPet]);

  const createPet = useCallback(async (name: string, speciesId: string): Promise<boolean> => {
    const speciesData = DEFAULT_PET_SPECIES.find(s => s.id === speciesId);
    if (!speciesData) return false;

    const newPet: PetState = {
      name,
      species: speciesId,
      skin: `pet-${speciesId}`,
      accessory: 'pet-acc-none',
      xp: 0,
      level: 1,
      storedHappiness: speciesData.baseHappiness,
      storedHunger: speciesData.baseHunger,
      storedEnergy: speciesData.baseEnergy,
      lastFed: null,
      lastUpdated: new Date().toISOString(),
    };

    if (!user) {
      // Local mode
      saveLocalPet(newPet);
      setRawPet(newPet);
      setPet(createLivePet(newPet));
      setHasPet(true);
      return true;
    }

    const { error } = await supabase!
      .from('pets')
      .insert({
        user_id: user.id,
        name,
        species: speciesId,
        skin: `pet-${speciesId}`,
        accessory: 'pet-acc-none',
        xp: 0,
        level: 1,
        stored_happiness: speciesData.baseHappiness,
        stored_hunger: speciesData.baseHunger,
        stored_energy: speciesData.baseEnergy,
        last_updated: new Date().toISOString(),
      });

    if (error) {
      console.error('Error creating pet:', error);
      return false;
    }

    await refreshPet();
    return true;
  }, [user, refreshPet]);

  const feedPet = useCallback(async (foodId: string): Promise<boolean> => {
    const foodDef = DEFAULT_FOODS.find(f => f.id === foodId);
    if (!foodDef || !rawPet) return false;

    // Check if user owns this food
    const ownedFood = ownedFoods.find(f => f.id === foodId);
    if (!ownedFood || ownedFood.quantity < 1) {
      toast.error(`You don't have any ${foodDef.name}`);
      return false;
    }

    // Apply food effects
    const now = new Date().toISOString();
    const livePet = createLivePet(rawPet);

    const updatedPet: PetState = {
      ...rawPet,
      storedHunger: Math.min(100, livePet.hunger + foodDef.hungerValue),
      storedHappiness: Math.min(100, livePet.happiness + foodDef.happinessValue),
      storedEnergy: Math.min(100, livePet.energy + foodDef.energyValue),
      xp: rawPet.xp + foodDef.xpValue,
      level: getPetLevel(rawPet.xp + foodDef.xpValue),
      lastFed: now,
      lastUpdated: now,
    };

    // Check for evolution
    const oldStage = getPetStage(rawPet.xp);
    const newStage = getPetStage(updatedPet.xp);
    if (newStage !== oldStage && newStage !== 'egg') {
      toast.success(`🎉 ${rawPet.name} evolved to ${newStage} stage!`);
    }

    if (!user) {
      // Local mode
      saveLocalPet(updatedPet);

      // Update food quantity
      const updatedFoods = ownedFoods.map(f =>
        f.id === foodId ? { ...f, quantity: f.quantity - 1 } : f
      ).filter(f => f.quantity > 0);
      saveLocalFoods(updatedFoods);
      setOwnedFoods(updatedFoods);

      setRawPet(updatedPet);
      setPet(createLivePet(updatedPet));
      return true;
    }

    // Update in database
    const { error: petError } = await supabase!
      .from('pets')
      .update({
        stored_hunger: updatedPet.storedHunger,
        stored_happiness: updatedPet.storedHappiness,
        stored_energy: updatedPet.storedEnergy,
        xp: updatedPet.xp,
        level: updatedPet.level,
        last_fed: now,
        last_updated: now,
      })
      .eq('user_id', user.id);

    if (petError) {
      console.error('Error feeding pet:', petError);
      return false;
    }

    // Update food quantity
    if (ownedFood.quantity > 1) {
      await supabase!
        .from('user_foods')
        .update({ quantity: ownedFood.quantity - 1 })
        .eq('user_id', user.id)
        .eq('food_id', foodId);
    } else {
      await supabase!
        .from('user_foods')
        .delete()
        .eq('user_id', user.id)
        .eq('food_id', foodId);
    }

    // Log feeding history
    await supabase!
      .from('feeding_history')
      .insert({
        user_id: user.id,
        pet_id: rawPet.id,
        food_id: foodId,
      });

    await refreshPet();
    return true;
  }, [user, rawPet, ownedFoods, refreshPet]);

  const buyFood = useCallback(async (foodId: string): Promise<boolean> => {
    const foodDef = DEFAULT_FOODS.find(f => f.id === foodId);
    if (!foodDef) return false;

    if (foodDef.premiumOnly) {
      toast.error('This item requires Premium');
      return false;
    }

    // Get user's coins (from habit store or local)
    const todaysCoins = getTodaysCoins();

    // For now, use a simple coin check - in production, this would come from the profile
    // We'll need to integrate with the main store for actual coin balance

    if (!user) {
      // Local mode - add to owned foods
      const existingFood = ownedFoods.find(f => f.id === foodId);
      let updatedFoods: OwnedFood[];

      if (existingFood) {
        updatedFoods = ownedFoods.map(f =>
          f.id === foodId ? { ...f, quantity: f.quantity + 1 } : f
        );
      } else {
        updatedFoods = [...ownedFoods, { ...foodDef, quantity: 1 }];
      }

      saveLocalFoods(updatedFoods);
      setOwnedFoods(updatedFoods);
      toast.success(`Bought ${foodDef.name}`);
      return true;
    }

    // Add food to user's inventory
    const existingFood = ownedFoods.find(f => f.id === foodId);

    if (existingFood) {
      await supabase!
        .from('user_foods')
        .update({ quantity: existingFood.quantity + 1 })
        .eq('user_id', user.id)
        .eq('food_id', foodId);
    } else {
      await supabase!
        .from('user_foods')
        .insert({
          user_id: user.id,
          food_id: foodId,
          quantity: 1,
        });
    }

    await refreshPet();
    toast.success(`Bought ${foodDef.name}`);
    return true;
  }, [user, ownedFoods, refreshPet, getTodaysCoins]);

  const renamePet = useCallback(async (name: string): Promise<boolean> => {
    if (!rawPet) return false;

    if (!user) {
      const updatedPet = { ...rawPet, name };
      saveLocalPet(updatedPet);
      setRawPet(updatedPet);
      setPet(createLivePet(updatedPet));
      return true;
    }

    const { error } = await supabase!
      .from('pets')
      .update({ name })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error renaming pet:', error);
      return false;
    }

    setRawPet(prev => prev ? { ...prev, name } : null);
    setPet(prev => prev ? { ...prev, name } : null);
    return true;
  }, [user, rawPet]);

  const addXP = useCallback(async (amount: number, reason?: string): Promise<void> => {
    if (!rawPet) return;

    const updatedPet: PetState = {
      ...rawPet,
      xp: rawPet.xp + amount,
      level: getPetLevel(rawPet.xp + amount),
      lastUpdated: new Date().toISOString(),
    };

    // Check for evolution
    const oldStage = getPetStage(rawPet.xp);
    const newStage = getPetStage(updatedPet.xp);
    if (newStage !== oldStage && newStage !== "egg") {
      toast.success(`🎉 ${rawPet.name} evolved to ${newStage} stage!`);
    }

    if (!user) {
      // Local mode
      saveLocalPet(updatedPet);
      setRawPet(updatedPet);
      setPet(createLivePet(updatedPet));
      if (reason) {
        toast.success(`+${amount} XP for ${rawPet.name}${reason ? ` (${reason})` : ""}`);
      }
      return;
    }

    // Update in database
    const { error } = await supabase!
      .from("pets")
      .update({
        xp: updatedPet.xp,
        level: updatedPet.level,
        last_updated: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error adding XP:", error);
      return;
    }

    setRawPet(updatedPet);
    setPet(createLivePet(updatedPet));

    if (reason) {
      toast.success(`+${amount} XP for ${rawPet.name} (${reason})`);
    }
  }, [user, rawPet]);

  const getXPReward = useCallback((): number => {
    // Calculate XP based on today's habit completion
    // This would ideally come from the habit store
    return XP_REWARDS.habitCompleted;
  }, []);

  return (
    <PetContext.Provider
      value={{
        pet,
        species,
        foods,
        ownedFoods,
        loading,
        hasPet,
        error,
        createPet,
        feedPet,
        buyFood,
        renamePet,
        refreshPet,
        addXP,
        getXPReward,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePet must be used within a PetProvider');
  }
  return context;
}

// Local storage helpers
const PET_KEY = 'future-me-pet';
const FOODS_KEY = 'future-me-foods';

function loadLocalPet(): PetState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PET_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveLocalPet(pet: PetState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PET_KEY, JSON.stringify(pet));
}

function loadLocalFoods(): OwnedFood[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FOODS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalFoods(foods: OwnedFood[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FOODS_KEY, JSON.stringify(foods));
}
