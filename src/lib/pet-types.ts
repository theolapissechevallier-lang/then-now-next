// Pet types and constants

export type PetRarity = 'common' | 'rare' | 'legendary';
export type PetStage = 'egg' | 'baby' | 'teen' | 'adult' | 'legendary';
export type FoodCategory = 'basic' | 'healthy' | 'energy' | 'premium';

export interface PetSpecies {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: PetRarity;
  baseHappiness: number;
  baseHunger: number;
  baseEnergy: number;
  unlockedByDefault: boolean;
}

export interface PetState {
  id?: string;
  name: string;
  species: string;
  skin: string;
  accessory: string;
  xp: number;
  level: number;
  storedHappiness: number;
  storedHunger: number;
  storedEnergy: number;
  lastFed: string | null;
  lastUpdated: string | null;
}

export interface LivePet extends PetState {
  hunger: number;
  happiness: number;
  energy: number;
  stage: PetStage;
  mood: PetMood;
}

export type PetMood =
  | 'happy'      // All stats high
  | 'hungry'     // Low hunger
  | 'tired'      // Low energy
  | 'sad'        // Low happiness
  | 'excited'    // Just fed
  | 'proud'      // Just evolved or achieved something
  | 'neutral';   // Normal

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  price: number;
  hungerValue: number;
  happinessValue: number;
  energyValue: number;
  xpValue: number;
  category: FoodCategory;
  premiumOnly: boolean;
}

export interface OwnedFood extends FoodItem {
  quantity: number;
}

// Pet stages based on XP thresholds
export const PET_STAGE_THRESHOLDS: { stage: PetStage; minXP: number; maxXP: number }[] = [
  { stage: 'egg', minXP: 0, maxXP: 100 },
  { stage: 'baby', minXP: 100, maxXP: 500 },
  { stage: 'teen', minXP: 500, maxXP: 1500 },
  { stage: 'adult', minXP: 1500, maxXP: 5000 },
  { stage: 'legendary', minXP: 5000, maxXP: Infinity },
];

// Calculate pet stage from XP
export function getPetStage(xp: number): PetStage {
  for (const threshold of PET_STAGE_THRESHOLDS) {
    if (xp >= threshold.minXP && xp < threshold.maxXP) {
      return threshold.stage;
    }
  }
  return 'legendary';
}

// Calculate level from XP (simpler progression)
export function getPetLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 10)) + 1;
}

// Calculate XP required for next level
export function getXPForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 10;
}

// Calculate XP progress to next level
export function getLevelProgress(xp: number): { current: number; required: number; progress: number } {
  const level = getPetLevel(xp);
  const prevRequired = level > 1 ? getXPForNextLevel(level - 1) : 0;
  const nextRequired = getXPForNextLevel(level);
  const currentXP = xp - prevRequired;
  const requiredXP = nextRequired - prevRequired;
  return {
    current: currentXP,
    required: requiredXP,
    progress: Math.min(1, currentXP / requiredXP),
  };
}

// Get pet mood based on stats
export function getPetMood(hunger: number, happiness: number, energy: number): PetMood {
  if (happiness >= 90 && hunger >= 70 && energy >= 70) return 'excited';
  if (happiness >= 70 && hunger >= 50 && energy >= 50) return 'happy';
  if (happiness < 25) return 'sad';
  if (hunger < 25) return 'hungry';
  if (energy < 25) return 'tired';
  return 'neutral';
}

// Calculate live stats (with decay)
export function calculateLiveStats(pet: PetState): { hunger: number; happiness: number; energy: number } {
  const now = Date.now();
  const lastUpdate = pet.lastUpdated ? Date.parse(pet.lastUpdated) : now;
  const hoursSinceUpdate = Math.max(0, (now - lastUpdate) / 36e5);

  // Decay rates per hour
  const hungerDecayRate = 3;  // Lose 3% hunger per hour
  const happinessDecayRate = 2; // Lose 2% happiness per hour
  const energyDecayRate = 1;  // Lose 1% energy per hour (slower)

  // Extra unhappiness when hungry
  const extraHappinessDecay = pet.storedHunger < 30 ? hoursSinceUpdate * 2 : 0;

  const hunger = Math.max(0, Math.min(100, pet.storedHunger - hoursSinceUpdate * hungerDecayRate));
  const happiness = Math.max(0, Math.min(100, pet.storedHappiness - hoursSinceUpdate * happinessDecayRate - extraHappinessDecay));
  const energy = Math.max(0, Math.min(100, pet.storedEnergy - hoursSinceUpdate * energyDecayRate));

  return { hunger, happiness, energy };
}

// Create live pet from stored state
export function createLivePet(pet: PetState): LivePet {
  const liveStats = calculateLiveStats(pet);
  const stage = getPetStage(pet.xp);
  const mood = getPetMood(liveStats.hunger, liveStats.happiness, liveStats.energy);

  return {
    ...pet,
    ...liveStats,
    stage,
    mood,
  };
}

// Default pet species - cute and collectible!
export const DEFAULT_PET_SPECIES: PetSpecies[] = [
  {
    id: 'fox',
    name: 'Ember',
    emoji: '🦊',
    description: 'A playful fox with a fluffy tail. Mischievous but loyal.',
    rarity: 'common',
    baseHappiness: 70,
    baseHunger: 50,
    baseEnergy: 60,
    unlockedByDefault: true,
  },
  {
    id: 'bunny',
    name: 'Cinnamon',
    emoji: '🐰',
    description: 'A gentle bunny with long floppy ears. Loves to cuddle.',
    rarity: 'common',
    baseHappiness: 80,
    baseHunger: 40,
    baseEnergy: 55,
    unlockedByDefault: true,
  },
  {
    id: 'cat',
    name: 'Mochi',
    emoji: '🐱',
    description: 'A sleek cat with a curious personality. Independent spirit.',
    rarity: 'common',
    baseHappiness: 65,
    baseHunger: 45,
    baseEnergy: 60,
    unlockedByDefault: true,
  },
  {
    id: 'owl',
    name: 'Hoot',
    emoji: '🦉',
    description: 'A wise owl who loves cozy nights. Great listener.',
    rarity: 'rare',
    baseHappiness: 60,
    baseHunger: 55,
    baseEnergy: 70,
    unlockedByDefault: false,
  },
  {
    id: 'wolf',
    name: 'Luna',
    emoji: '🐺',
    description: 'A loyal wolf with a fluffy mane. Always by your side.',
    rarity: 'rare',
    baseHappiness: 75,
    baseHunger: 60,
    baseEnergy: 65,
    unlockedByDefault: false,
  },
  {
    id: 'bear',
    name: 'Maple',
    emoji: '🧸',
    description: 'A round, huggable bear. Everyone wants to squeeze them.',
    rarity: 'rare',
    baseHappiness: 85,
    baseHunger: 55,
    baseEnergy: 50,
    unlockedByDefault: false,
  },
  {
    id: 'dragon',
    name: 'Ember',
    emoji: '🐲',
    description: 'A tiny dragon with a big heart. Breathes tiny sparkles!',
    rarity: 'legendary',
    baseHappiness: 70,
    baseHunger: 65,
    baseEnergy: 80,
    unlockedByDefault: false,
  },
];

// Default foods
export const DEFAULT_FOODS: FoodItem[] = [
  // Basic
  {
    id: 'apple',
    name: 'Apple',
    emoji: '🍎',
    description: 'A fresh apple. Simple and healthy.',
    price: 5,
    hungerValue: 10,
    happinessValue: 5,
    energyValue: 5,
    xpValue: 2,
    category: 'basic',
    premiumOnly: false,
  },
  {
    id: 'bread',
    name: 'Bread',
    emoji: '🍞',
    description: 'Soft and filling.',
    price: 8,
    hungerValue: 15,
    happinessValue: 3,
    energyValue: 0,
    xpValue: 1,
    category: 'basic',
    premiumOnly: false,
  },
  {
    id: 'carrot',
    name: 'Carrot',
    emoji: '🥕',
    description: 'Crunchy and nutritious.',
    price: 6,
    hungerValue: 8,
    happinessValue: 4,
    energyValue: 8,
    xpValue: 2,
    category: 'basic',
    premiumOnly: false,
  },
  // Healthy
  {
    id: 'salad',
    name: 'Fresh Salad',
    emoji: '🥗',
    description: 'Packed with vitamins.',
    price: 20,
    hungerValue: 25,
    happinessValue: 15,
    energyValue: 20,
    xpValue: 8,
    category: 'healthy',
    premiumOnly: false,
  },
  {
    id: 'berries',
    name: 'Mixed Berries',
    emoji: '🫐',
    description: 'Antioxidant-rich treats.',
    price: 25,
    hungerValue: 20,
    happinessValue: 25,
    energyValue: 15,
    xpValue: 10,
    category: 'healthy',
    premiumOnly: false,
  },
  {
    id: 'smoothie',
    name: 'Power Smoothie',
    emoji: '🥤',
    description: 'Bursting with energy!',
    price: 35,
    hungerValue: 30,
    happinessValue: 20,
    energyValue: 35,
    xpValue: 15,
    category: 'healthy',
    premiumOnly: false,
  },
  // Energy
  {
    id: 'coffee',
    name: 'Coffee',
    emoji: '☕',
    description: 'A quick energy boost!',
    price: 15,
    hungerValue: 0,
    happinessValue: 5,
    energyValue: 40,
    xpValue: 3,
    category: 'energy',
    premiumOnly: false,
  },
  {
    id: 'energy_bar',
    name: 'Energy Bar',
    emoji: '🍫',
    description: 'Sustained energy release.',
    price: 30,
    hungerValue: 10,
    happinessValue: 10,
    energyValue: 50,
    xpValue: 8,
    category: 'energy',
    premiumOnly: false,
  },
  {
    id: 'potion',
    name: 'Energy Potion',
    emoji: '🧪',
    description: 'Maximum energy restoration!',
    price: 50,
    hungerValue: 5,
    happinessValue: 15,
    energyValue: 80,
    xpValue: 20,
    category: 'energy',
    premiumOnly: false,
  },
  // Premium
  {
    id: 'golden_apple',
    name: 'Golden Apple',
    emoji: '🌟',
    description: 'Legendary fruit of happiness.',
    price: 0,
    hungerValue: 50,
    happinessValue: 50,
    energyValue: 50,
    xpValue: 50,
    category: 'premium',
    premiumOnly: true,
  },
  {
    id: 'feast',
    name: 'Royal Feast',
    emoji: '🍽️',
    description: 'A meal fit for royalty.',
    price: 0,
    hungerValue: 80,
    happinessValue: 60,
    energyValue: 40,
    xpValue: 100,
    category: 'premium',
    premiumOnly: true,
  },
  {
    id: 'star_candy',
    name: 'Star Candy',
    emoji: '⭐',
    description: 'Magical candy that grants XP.',
    price: 0,
    hungerValue: 20,
    happinessValue: 80,
    energyValue: 20,
    xpValue: 200,
    category: 'premium',
    premiumOnly: true,
  },
];

// XP rewards for actions
export const XP_REWARDS = {
  habitCompleted: 5,       // Base XP per habit logged
  habitTargetMet: 10,     // Bonus for meeting daily target
  streakDay: 3,           // XP per day of streak
  streakWeek: 25,         // Bonus for 7-day streak
  streakMonth: 100,       // Bonus for 30-day streak
  petEvolved: 200,        // Bonus when pet evolves
};

// Calculate XP from habit completion
export function calculateHabitXP(
  habitXP: number,
  metTarget: boolean,
  streak: number
): number {
  let total = XP_REWARDS.habitCompleted;
  if (metTarget) total += XP_REWARDS.habitTargetMet;

  // Streak bonuses
  if (streak > 0) {
    total += Math.min(streak, 7) * XP_REWARDS.streakDay;
    if (streak >= 7) total += XP_REWARDS.streakWeek;
    if (streak >= 30) total += XP_REWARDS.streakMonth;
  }

  return total;
}
