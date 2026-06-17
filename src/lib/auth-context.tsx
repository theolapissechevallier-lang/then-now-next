import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseAvailable } from "./supabase";
import { claimReferral, popPendingReferral } from "./referrals";
import { toast } from "sonner";

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAvailable: boolean;
};

type AuthActions = {
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<(AuthState & AuthActions) | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isAvailable: isSupabaseAvailable(),
  });

  useEffect(() => {
    if (!supabase) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase!.auth.getSession();
        if (mounted) {
          if (error) {
            console.error("Session fetch error:", error);
          }
          setState((prev) => ({
            ...prev,
            session,
            user: session?.user ?? null,
            loading: false,
          }));
        }
      } catch (err) {
        console.error("Init session error:", err);
        if (mounted) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
    };

    initSession();

    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setState((prev) => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
        }));
        if (_event === "SIGNED_IN" && session?.user) {
          const pending = popPendingReferral();
          if (pending) {
            void claimReferral(pending).then((res) => {
              if (res.ok) {
                toast.success("Invite redeemed! +25 coins · +15 XP");
              } else if (res.reason && res.reason !== "already_redeemed" && res.reason !== "self_referral") {
                // Silent on the rest.
              }
            });
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: "Authentication unavailable", name: "AuthUnavailable" } as AuthError };
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      return { error };
    }

    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: "Authentication unavailable", name: "AuthUnavailable" } as AuthError };
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      return { error };
    }

    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;

    setState((prev) => ({ ...prev, loading: true }));

    await supabase.auth.signOut();

    setState((prev) => ({
      ...prev,
      user: null,
      session: null,
      loading: false,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
