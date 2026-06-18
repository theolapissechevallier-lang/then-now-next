import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useAuth } from "./auth-context";
import { supabase } from "./supabase";
import {
  type AvatarState,
  type CosmeticItem,
  type OwnedCosmetic,
  type UserBalance,
  DEFAULT_AVATAR,
  DEFAULT_COSMETICS,
} from "./avatar-types";
import { useHabits } from "./habit-store";
import { toast } from "sonner";

type AvatarStateType = {
  avatar: AvatarState;
  cosmetics: CosmeticItem[];
  ownedCosmetics: OwnedCosmetic[];
  balance: UserBalance;
  loading: boolean;
  error: string | null;
};

type AvatarActions = {
  updateAvatar: (updates: Partial<AvatarState>) => Promise<boolean>;
  buyCosmetic: (itemId: string) => Promise<boolean>;
  equipCosmetic: (itemId: string) => Promise<boolean>;
  unequipCosmetic: (itemId: string) => Promise<boolean>;
  getCosmeticById: (itemId: string) => CosmeticItem | undefined;
  getOwnedCosmeticsByType: (type: string) => OwnedCosmetic[];
  canAfford: (price: number) => boolean;
  refreshAvatar: () => Promise<void>;
};

const AvatarContext = createContext<(AvatarStateType & AvatarActions) | null>(null);

export function AvatarProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { getTodaysCoins } = useHabits();
  const [avatar, setAvatar] = useState<AvatarState>(DEFAULT_AVATAR);
  const [cosmetics] = useState<CosmeticItem[]>(DEFAULT_COSMETICS);
  const [ownedCosmetics, setOwnedCosmetics] = useState<OwnedCosmetic[]>([]);
  const [balance, setBalance] = useState<UserBalance>({ coins: 0, totalEarned: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAvatar = useCallback(async () => {
    setError(null);

    if (!user) {
      // Local mode
      const localAvatar = loadLocalAvatar();
      if (localAvatar) {
        setAvatar(localAvatar);
      } else {
        setAvatar(DEFAULT_AVATAR);
        saveLocalAvatar(DEFAULT_AVATAR);
      }

      const localOwned = loadLocalOwnedCosmetics();
      setOwnedCosmetics(localOwned);

      const localBalance = loadLocalBalance();
      setBalance(localBalance);

      setLoading(false);
      return;
    }

    try {
      // Load avatar from database
      const { data: avatarData, error: avatarError } = await supabase!
        .from('user_avatars')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (avatarError) {
        console.error('Error loading avatar:', avatarError);
        setError('Failed to load avatar data');
      } else if (avatarData) {
        setAvatar({
          hairStyle: avatarData.hair_style ?? DEFAULT_AVATAR.hairStyle,
          hairColor: avatarData.hair_color ?? DEFAULT_AVATAR.hairColor,
          eyeStyle: avatarData.eye_style ?? DEFAULT_AVATAR.eyeStyle,
          eyeColor: avatarData.eye_color ?? DEFAULT_AVATAR.eyeColor,
          skinTone: avatarData.skin_tone ?? DEFAULT_AVATAR.skinTone,
          outfit: avatarData.outfit ?? DEFAULT_AVATAR.outfit,
          outfitColor: avatarData.outfit_color ?? DEFAULT_AVATAR.outfitColor,
          accessory: avatarData.accessory ?? DEFAULT_AVATAR.accessory,
          background: avatarData.background ?? DEFAULT_AVATAR.background,
          title: avatarData.title ?? DEFAULT_AVATAR.title,
        });
      } else {
        // Create default avatar
        setAvatar(DEFAULT_AVATAR);
        await supabase!
          .from('user_avatars')
          .insert({
            user_id: user.id,
            hair_style: DEFAULT_AVATAR.hairStyle,
            hair_color: DEFAULT_AVATAR.hairColor,
            eye_style: DEFAULT_AVATAR.eyeStyle,
            eye_color: DEFAULT_AVATAR.eyeColor,
            skin_tone: DEFAULT_AVATAR.skinTone,
            outfit: DEFAULT_AVATAR.outfit,
            outfit_color: DEFAULT_AVATAR.outfitColor,
            accessory: DEFAULT_AVATAR.accessory,
            background: DEFAULT_AVATAR.background,
            title: DEFAULT_AVATAR.title,
          });
      }

      // Load owned cosmetics
      const { data: cosmeticsData, error: cosmeticsError } = await supabase!
        .from('user_cosmetics')
        .select('*')
        .eq('user_id', user.id);

      if (cosmeticsError) {
        console.error('Error loading cosmetics:', cosmeticsError);
      } else if (cosmeticsData) {
        const owned: OwnedCosmetic[] = cosmeticsData.map(c => {
          const item = DEFAULT_COSMETICS.find(cos => cos.id === c.item_id);
          return item ? {
            ...item,
            owned: c.owned ?? true,
            equipped: c.equipped ?? false,
          } : null;
        }).filter((c): c is OwnedCosmetic => c !== null);
        setOwnedCosmetics(owned);
      }

      // Load balance
      const { data: balanceData, error: balanceError } = await supabase!
        .from('user_balances')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (balanceError) {
        console.error('Error loading balance:', balanceError);
      } else if (balanceData) {
        setBalance({
          coins: balanceData.coins ?? 0,
          totalEarned: balanceData.total_earned ?? 0,
          totalSpent: balanceData.total_spent ?? 0,
        });
      } else {
        // Calculate initial balance from today's logs
        const todaysCoins = getTodaysCoins();
        setBalance({ coins: todaysCoins, totalEarned: todaysCoins, totalSpent: 0 });
        await supabase!
          .from('user_balances')
          .insert({
            user_id: user.id,
            coins: todaysCoins,
            total_earned: todaysCoins,
            total_spent: 0,
          });
      }
    } catch (err) {
      console.error('Unexpected error loading avatar:', err);
      setError('An unexpected error occurred');
    }

    setLoading(false);
  }, [user, getTodaysCoins]);

  useEffect(() => {
    refreshAvatar();
  }, [refreshAvatar]);

  // Sync coins from habit tracking
  useEffect(() => {
    if (!user || loading) return;

    const todaysCoins = getTodaysCoins();
    if (todaysCoins !== balance.coins) {
      // Update balance with new coins earned
      const newTotal = balance.totalEarned + (todaysCoins - balance.coins);
      setBalance(prev => ({
        ...prev,
        coins: todaysCoins,
        totalEarned: newTotal,
      }));

      supabase!
        .from('user_balances')
        .upsert({
          user_id: user.id,
          coins: todaysCoins,
          total_earned: newTotal,
          total_spent: balance.totalSpent,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    }
  }, [user, getTodaysCoins, balance, loading]);

  const updateAvatar = useCallback(async (updates: Partial<AvatarState>): Promise<boolean> => {
    const newAvatar = { ...avatar, ...updates };
    setAvatar(newAvatar);

    if (!user) {
      saveLocalAvatar(newAvatar);
      return true;
    }

    const { error } = await supabase!
      .from('user_avatars')
      .update({
        hair_style: newAvatar.hairStyle,
        hair_color: newAvatar.hairColor,
        eye_style: newAvatar.eyeStyle,
        eye_color: newAvatar.eyeColor,
        skin_tone: newAvatar.skinTone,
        outfit: newAvatar.outfit,
        outfit_color: newAvatar.outfitColor,
        accessory: newAvatar.accessory,
        background: newAvatar.background,
        title: newAvatar.title,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to save changes');
      return false;
    }

    return true;
  }, [user, avatar]);

  const buyCosmetic = useCallback(async (itemId: string): Promise<boolean> => {
    const item = cosmetics.find(c => c.id === itemId);
    if (!item) {
      toast.error('Item not found');
      return false;
    }

    // Check if already owned
    if (ownedCosmetics.some(c => c.id === itemId)) {
      toast.error('You already own this item');
      return false;
    }

    // Check premium
    if (item.premiumOnly) {
      toast.error('This item requires Premium');
      return false;
    }

    // Check balance
    if (balance.coins < item.price) {
      toast.error(`Not enough coins. Need ${item.price} coins.`);
      return false;
    }

    // Deduct coins
    const newBalance = {
      coins: balance.coins - item.price,
      totalEarned: balance.totalEarned,
      totalSpent: balance.totalSpent + item.price,
    };
    setBalance(newBalance);

    // Add to owned cosmetics
    const ownedItem: OwnedCosmetic = { ...item, owned: true, equipped: false };
    const newOwned = [...ownedCosmetics, ownedItem];
    setOwnedCosmetics(newOwned);

    if (!user) {
      saveLocalBalance(newBalance);
      saveLocalOwnedCosmetics(newOwned);
      toast.success(`Purchased ${item.name}!`);
      return true;
    }

    // Update database
    const { error: balanceError } = await supabase!
      .from('user_balances')
      .upsert({
        user_id: user.id,
        ...newBalance,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (balanceError) {
      console.error('Error updating balance:', balanceError);
      toast.error('Failed to complete purchase');
      return false;
    }

    const { error: cosmeticError } = await supabase!
      .from('user_cosmetics')
      .insert({
        user_id: user.id,
        item_id: itemId,
        owned: true,
        equipped: false,
      });

    if (cosmeticError) {
      console.error('Error adding cosmetic:', cosmeticError);
      toast.error('Failed to complete purchase');
      return false;
    }

    toast.success(`Purchased ${item.name}!`);
    return true;
  }, [user, cosmetics, ownedCosmetics, balance]);

  const equipCosmetic = useCallback(async (itemId: string): Promise<boolean> => {
    const item = cosmetics.find(c => c.id === itemId);
    if (!item) return false;

    const owned = ownedCosmetics.find(c => c.id === itemId);
    if (!owned) {
      toast.error('You do not own this item');
      return false;
    }

    // Determine what to update in avatar
    const updates: Partial<AvatarState> = {};
    switch (item.type) {
      case 'hair':
        updates.hairStyle = itemId.replace('hair-', '');
        break;
      case 'eyes':
        updates.eyeStyle = itemId.replace('eyes-', '');
        break;
      case 'outfit':
        updates.outfit = itemId.replace('outfit-', '');
        break;
      case 'accessory':
        updates.accessory = itemId.replace('acc-', '');
        break;
      case 'background':
        updates.background = itemId.replace('bg-', '');
        break;
      case 'title':
        updates.title = item.name;
        break;
    }

    // Update avatar
    if (!(await updateAvatar(updates))) {
      return false;
    }

    // Update equipped status
    const newOwned = ownedCosmetics.map(c => ({
      ...c,
      equipped: c.id === itemId || (c.type === item.type && c.equipped ? false : c.equipped),
    }));
    setOwnedCosmetics(newOwned);

    if (!user) {
      saveLocalOwnedCosmetics(newOwned);
      return true;
    }

    // Unequip other items of same type
    await supabase!
      .from('user_cosmetics')
      .update({ equipped: false })
      .eq('user_id', user.id)
      .in('item_id', cosmetics.filter(c => c.type === item.type && c.id !== itemId).map(c => c.id));

    // Equip this item
    await supabase!
      .from('user_cosmetics')
      .upsert({
        user_id: user.id,
        item_id: itemId,
        owned: true,
        equipped: true,
      }, { onConflict: 'user_id,item_id' });

    return true;
  }, [user, cosmetics, ownedCosmetics, updateAvatar]);

  const unequipCosmetic = useCallback(async (itemId: string): Promise<boolean> => {
    const item = cosmetics.find(c => c.id === itemId);
    if (!item) return false;

    // Update avatar to remove this item
    const updates: Partial<AvatarState> = {};
    switch (item.type) {
      case 'hair':
        updates.hairStyle = 'short';
        break;
      case 'eyes':
        updates.eyeStyle = 'normal';
        break;
      case 'outfit':
        updates.outfit = 'casual';
        break;
      case 'accessory':
        updates.accessory = 'none';
        break;
      case 'background':
        updates.background = 'none';
        break;
      case 'title':
        updates.title = '';
        break;
    }

    if (!(await updateAvatar(updates))) {
      return false;
    }

    // Update equipped status
    const newOwned = ownedCosmetics.map(c => ({
      ...c,
      equipped: c.id === itemId ? false : c.equipped,
    }));
    setOwnedCosmetics(newOwned);

    if (!user) {
      saveLocalOwnedCosmetics(newOwned);
      return true;
    }

    await supabase!
      .from('user_cosmetics')
      .update({ equipped: false })
      .eq('user_id', user.id)
      .eq('item_id', itemId);

    return true;
  }, [user, cosmetics, ownedCosmetics, updateAvatar]);

  const getCosmeticById = useCallback((itemId: string): CosmeticItem | undefined => {
    return cosmetics.find(c => c.id === itemId);
  }, [cosmetics]);

  const getOwnedCosmeticsByType = useCallback((type: string): OwnedCosmetic[] => {
    return ownedCosmetics.filter(c => c.type === type);
  }, [ownedCosmetics]);

  const canAfford = useCallback((price: number): boolean => {
    return balance.coins >= price;
  }, [balance]);

  return (
    <AvatarContext.Provider
      value={{
        avatar,
        cosmetics,
        ownedCosmetics,
        balance,
        loading,
        error,
        updateAvatar,
        buyCosmetic,
        equipCosmetic,
        unequipCosmetic,
        getCosmeticById,
        getOwnedCosmeticsByType,
        canAfford,
        refreshAvatar,
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
}

// Local storage helpers
const AVATAR_KEY = 'future-me-avatar';
const OWNED_KEY = 'future-me-owned-cosmetics';
const BALANCE_KEY = 'future-me-balance';

function loadLocalAvatar(): AvatarState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AVATAR_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalAvatar(avatar: AvatarState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AVATAR_KEY, JSON.stringify(avatar));
}

function loadLocalOwnedCosmetics(): OwnedCosmetic[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OWNED_KEY);
    if (!raw) {
      // Default owned items
      return DEFAULT_COSMETICS.filter(c => c.price === 0).map(c => ({ ...c, owned: true, equipped: false }));
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_COSMETICS.filter(c => c.price === 0).map(c => ({ ...c, owned: true, equipped: false }));
  }
}

function saveLocalOwnedCosmetics(cosmetics: OwnedCosmetic[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OWNED_KEY, JSON.stringify(cosmetics));
}

function loadLocalBalance(): UserBalance {
  if (typeof window === 'undefined') return { coins: 0, totalEarned: 0, totalSpent: 0 };
  try {
    const raw = localStorage.getItem(BALANCE_KEY);
    return raw ? JSON.parse(raw) : { coins: 0, totalEarned: 0, totalSpent: 0 };
  } catch {
    return { coins: 0, totalEarned: 0, totalSpent: 0 };
  }
}

function saveLocalBalance(balance: UserBalance) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BALANCE_KEY, JSON.stringify(balance));
}
