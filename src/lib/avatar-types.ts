// Avatar types and cosmetics constants

export type CosmeticRarity = 'common' | 'rare' | 'legendary';
export type CosmeticType = 'hair' | 'eyes' | 'outfit' | 'accessory' | 'background' | 'title';

export interface CosmeticItem {
  id: string;
  name: string;
  type: CosmeticType;
  rarity: CosmeticRarity;
  price: number;
  premiumOnly: boolean;
  colors: string[];
}

export interface OwnedCosmetic extends CosmeticItem {
  owned: boolean;
  equipped: boolean;
}

export interface AvatarState {
  hairStyle: string;
  hairColor: string;
  eyeStyle: string;
  eyeColor: string;
  skinTone: string;
  outfit: string;
  outfitColor: string;
  accessory: string;
  background: string;
  title: string;
}

export interface UserBalance {
  coins: number;
  totalEarned: number;
  totalSpent: number;
}

// Default skin tones
export const SKIN_TONES = [
  '#fde8d9',
  '#e8d5c4',
  '#d4a574',
  '#b8860b',
  '#8b6914',
  '#5d4e37',
];

// Default cosmetic items (also in database)
export const DEFAULT_COSMETICS: CosmeticItem[] = [
  // Hair styles
  { id: 'hair-short', name: 'Short Hair', type: 'hair', rarity: 'common', price: 0, premiumOnly: false, colors: ['#4a3728', '#1a1a1f', '#d4a574', '#c44536', '#5e7a6b'] },
  { id: 'hair-long', name: 'Long Hair', type: 'hair', rarity: 'common', price: 50, premiumOnly: false, colors: ['#4a3728', '#1a1a1f', '#d4a574', '#c44536', '#5e7a6b'] },
  { id: 'hair-curly', name: 'Curly Hair', type: 'hair', rarity: 'rare', price: 100, premiumOnly: false, colors: ['#4a3728', '#1a1a1f', '#d4a574', '#c44536', '#5e7a6b'] },
  { id: 'hair-spiky', name: 'Spiky Hair', type: 'hair', rarity: 'rare', price: 100, premiumOnly: false, colors: ['#4a3728', '#1a1a1f', '#d4a574', '#c44536', '#5e7a6b'] },
  { id: 'hair-mohawk', name: 'Mohawk', type: 'hair', rarity: 'legendary', price: 0, premiumOnly: true, colors: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3'] },

  // Eyes
  { id: 'eyes-normal', name: 'Normal Eyes', type: 'eyes', rarity: 'common', price: 0, premiumOnly: false, colors: ['#3d5a80', '#2d6a4f', '#6b2737', '#1a1a1f'] },
  { id: 'eyes-round', name: 'Round Eyes', type: 'eyes', rarity: 'common', price: 30, premiumOnly: false, colors: ['#3d5a80', '#2d6a4f', '#6b2737', '#1a1a1f'] },
  { id: 'eyes-sharp', name: 'Sharp Eyes', type: 'eyes', rarity: 'rare', price: 80, premiumOnly: false, colors: ['#3d5a80', '#2d6a4f', '#6b2737', '#1a1a1f'] },
  { id: 'eyes-glowing', name: 'Glowing Eyes', type: 'eyes', rarity: 'legendary', price: 0, premiumOnly: true, colors: ['#00ff88', '#ff00ff', '#00ffff'] },

  // Outfits
  { id: 'outfit-casual', name: 'Casual Outfit', type: 'outfit', rarity: 'common', price: 0, premiumOnly: false, colors: ['#5e7a6b', '#3d5a80', '#6b2737', '#4a3728'] },
  { id: 'outfit-hoodie', name: 'Hoodie', type: 'outfit', rarity: 'common', price: 60, premiumOnly: false, colors: ['#1a1a1f', '#3d5a80', '#6b2737', '#2d6a4f'] },
  { id: 'outfit-formal', name: 'Formal Suit', type: 'outfit', rarity: 'rare', price: 150, premiumOnly: false, colors: ['#1a1a1f', '#2d3748', '#744210'] },
  { id: 'outfit-armor', name: 'Hero Armor', type: 'outfit', rarity: 'legendary', price: 0, premiumOnly: true, colors: ['#ffd700', '#c0c0c0', '#cd7f32'] },

  // Accessories
  { id: 'acc-none', name: 'No Accessory', type: 'accessory', rarity: 'common', price: 0, premiumOnly: false, colors: [] },
  { id: 'acc-glasses', name: 'Glasses', type: 'accessory', rarity: 'common', price: 40, premiumOnly: false, colors: ['#1a1a1f', '#d4a574'] },
  { id: 'acc-sunglasses', name: 'Sunglasses', type: 'accessory', rarity: 'rare', price: 90, premiumOnly: false, colors: ['#1a1a1f', '#d4a574'] },
  { id: 'acc-headphones', name: 'Headphones', type: 'accessory', rarity: 'rare', price: 120, premiumOnly: false, colors: ['#1a1a1f', '#3d5a80', '#ff6b6b'] },
  { id: 'acc-crown', name: 'Crown', type: 'accessory', rarity: 'legendary', price: 0, premiumOnly: true, colors: ['#ffd700'] },

  // Backgrounds
  { id: 'bg-none', name: 'No Background', type: 'background', rarity: 'common', price: 0, premiumOnly: false, colors: [] },
  { id: 'bg-sunset', name: 'Sunset', type: 'background', rarity: 'common', price: 75, premiumOnly: false, colors: [] },
  { id: 'bg-night', name: 'Night Sky', type: 'background', rarity: 'rare', price: 150, premiumOnly: false, colors: [] },
  { id: 'bg-forest', name: 'Forest', type: 'background', rarity: 'rare', price: 150, premiumOnly: false, colors: [] },
  { id: 'bg-cosmic', name: 'Cosmic', type: 'background', rarity: 'legendary', price: 0, premiumOnly: true, colors: [] },

  // Titles
  { id: 'title-none', name: '', type: 'title', rarity: 'common', price: 0, premiumOnly: false, colors: [] },
  { id: 'title-seeker', name: 'The Seeker', type: 'title', rarity: 'common', price: 100, premiumOnly: false, colors: [] },
  { id: 'title-habit-master', name: 'Habit Master', type: 'title', rarity: 'rare', price: 300, premiumOnly: false, colors: [] },
  { id: 'title-pet-whisperer', name: 'Pet Whisperer', type: 'title', rarity: 'rare', price: 300, premiumOnly: false, colors: [] },
  { id: 'title-legend', name: 'Living Legend', type: 'title', rarity: 'legendary', price: 0, premiumOnly: true, colors: [] },
];

// Default avatar state
export const DEFAULT_AVATAR: AvatarState = {
  hairStyle: 'short',
  hairColor: '#4a3728',
  eyeStyle: 'normal',
  eyeColor: '#3d5a80',
  skinTone: '#e8d5c4',
  outfit: 'casual',
  outfitColor: '#5e7a6b',
  accessory: 'none',
  background: 'none',
  title: '',
};

// Helper to get cosmetics by type
export function getCosmeticsByType(type: CosmeticType): CosmeticItem[] {
  return DEFAULT_COSMETICS.filter(c => c.type === type);
}

// Helper to get rarity color
export function getRarityColor(rarity: CosmeticRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af';
    case 'rare': return '#3b82f6';
    case 'legendary': return '#fbbf24';
    default: return '#9ca3af';
  }
}

// Helper to get background style
export function getBackgroundStyle(bgId: string): string {
  switch (bgId) {
    case 'sunset': return 'linear-gradient(to bottom, #ff6b6b, #ffd93d)';
    case 'night': return 'linear-gradient(to bottom, #0f0f23, #1a1a2e, #16213e)';
    case 'forest': return 'linear-gradient(to bottom, #134e4a, #1e3a2f)';
    case 'cosmic': return 'linear-gradient(to bottom, #1a0033, #330066, #4d0099)';
    default: return 'transparent';
  }
}
