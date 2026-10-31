"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient, getSessionAccessToken } from "@/lib/supabase/browser";
import { setAccessTokenProvider } from "@/lib/api/token";

/**
 * The one place that knows who is signed in.
 *
 * It also hands the API client its bearer token, and it wipes the query cache on
 * a sign-in and a sign-out: a cache of another account's bets and balance is the
 * worst kind of stale data to keep.
 */
export interface AuthState {
  readonly user: User | null;
  readonly session: Session | null;
  readonly loading: boolean;
  readonly signedIn: boolean;
  /** Re-reads the session, for a screen that has just changed it. */
  readonly refresh: () => Promise<void>;
  readonly signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAccessTokenProvider(getSessionAccessToken);

    const client = getSupabaseBrowserClient();
    if (!client) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    void client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data } = client.auth.onAuthStateChange((event, next) => {
      setSession(next);
      setLoading(false);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        void queryClient.invalidateQueries();
        queryClient.clear();
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [queryClient]);

  const refresh = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    const { data } = await client.auth.getSession();
    setSession(data.session);
  }, []);

  const signOut = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    await client.auth.signOut();
    queryClient.clear();
    setSession(null);
  }, [queryClient]);

  const value = useMemo<AuthState>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      signedIn: session !== null,
      refresh,
      signOut,
    }),
    [session, loading, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
