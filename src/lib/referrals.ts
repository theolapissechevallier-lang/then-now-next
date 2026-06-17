import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth-context";

export const PENDING_REFERRAL_KEY = "future-me:pending-referral";

export type ReferralRow = {
  id: string;
  code: string;
  referrer_id: string;
  referred_id: string | null;
  rewarded: boolean;
  created_at: string;
};

export type ReferralStats = {
  code: string | null;
  inviteUrl: string;
  totalJoined: number;
  totalRewarded: number;
  totalCoinsEarned: number;
  totalXpEarned: number;
  rows: ReferralRow[];
};

const REWARD_PER_INVITE = { coins: 50, xp: 30 };

export const REFERRAL_MILESTONES: Array<{
  count: number;
  label: string;
  reward: string;
}> = [
  { count: 1, label: "First Recruit", reward: "+50 coins · +30 XP" },
  { count: 5, label: "Growth Leader", reward: "Rare cosmetic" },
  { count: 10, label: "Community Builder", reward: "Epic pet skin" },
  { count: 25, label: "Trailblazer", reward: "Legendary frame" },
  { count: 50, label: "Future Master", reward: "Premium aura" },
];

export function inviteUrlFor(code: string | null | undefined): string {
  if (!code) return "";
  if (typeof window === "undefined") return `/invite/${code}`;
  return `${window.location.origin}/invite/${code}`;
}

export function setPendingReferral(code: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PENDING_REFERRAL_KEY, code.toUpperCase());
  } catch {
    /* ignore */
  }
}

export function popPendingReferral(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(PENDING_REFERRAL_KEY);
    if (v) window.localStorage.removeItem(PENDING_REFERRAL_KEY);
    return v;
  } catch {
    return null;
  }
}

export async function claimReferral(code: string): Promise<{ ok: boolean; reason?: string }> {
  if (!supabase) return { ok: false, reason: "offline" };
  const { data, error } = await supabase.rpc("claim_referral", { p_code: code });
  if (error) {
    console.warn("claim_referral", error);
    return { ok: false, reason: error.message };
  }
  const payload = (data ?? {}) as { ok?: boolean; reason?: string };
  return { ok: !!payload.ok, reason: payload.reason };
}

export async function checkReferralCode(code: string): Promise<boolean> {
  if (!supabase || !code) return false;
  const { data, error } = await supabase.rpc("referral_code_exists", { p_code: code });
  if (error) return false;
  return !!data;
}

export async function fetchReferralStats(
  userId: string,
  code: string | null,
): Promise<ReferralStats> {
  const empty: ReferralStats = {
    code,
    inviteUrl: inviteUrlFor(code),
    totalJoined: 0,
    totalRewarded: 0,
    totalCoinsEarned: 0,
    totalXpEarned: 0,
    rows: [],
  };
  if (!supabase) return empty;
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("fetchReferralStats", error);
    return empty;
  }
  const rows = (data ?? []) as ReferralRow[];
  const joined = rows.filter((r) => !!r.referred_id);
  const rewarded = joined.filter((r) => r.rewarded);
  return {
    code,
    inviteUrl: inviteUrlFor(code),
    totalJoined: joined.length,
    totalRewarded: rewarded.length,
    totalCoinsEarned: rewarded.length * REWARD_PER_INVITE.coins,
    totalXpEarned: rewarded.length * REWARD_PER_INVITE.xp,
    rows,
  };
}

async function fetchOwnReferralCode(userId: string): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", userId)
    .maybeSingle();
  return (data?.referral_code as string | undefined) ?? null;
}

export function useReferrals() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats>({
    code: null,
    inviteUrl: "",
    totalJoined: 0,
    totalRewarded: 0,
    totalCoinsEarned: 0,
    totalXpEarned: 0,
    rows: [],
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setStats({
        code: null,
        inviteUrl: "",
        totalJoined: 0,
        totalRewarded: 0,
        totalCoinsEarned: 0,
        totalXpEarned: 0,
        rows: [],
      });
      setLoading(false);
      return;
    }
    setLoading(true);
    const code = await fetchOwnReferralCode(user.id);
    const next = await fetchReferralStats(user.id, code);
    setStats(next);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { stats, loading, refresh };
}

export function nextMilestone(count: number) {
  return REFERRAL_MILESTONES.find((m) => count < m.count) ?? null;
}

export function buildShareMessage(url: string) {
  return `I'm building my Future Me — join me and we both get bonus rewards! ${url}`;
}

export function shareTargets(url: string) {
  const msg = encodeURIComponent(buildShareMessage(url));
  const u = encodeURIComponent(url);
  return {
    whatsapp: `https://wa.me/?text=${msg}`,
    messenger: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    // Instagram & TikTok have no public web share intent → fallback: copy + open app/site.
    instagram: `https://www.instagram.com/`,
    tiktok: `https://www.tiktok.com/`,
  };
}