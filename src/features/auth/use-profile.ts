"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { readOwnProfileWithRetry, type ProfileRow } from "@/lib/auth/profile";
import { useAuth } from "@/components/providers/auth-provider";

export const profileQueryKey = (userId: string) => ["profile", userId] as const;

/**
 * The signed-in player's own row.
 *
 * RLS limits this to their row, so there is no id to look up beyond their own and
 * no way to read anyone else's. Retried reads cover the moment between sign-up and
 * the trigger's insert.
 */
export function useProfile() {
  const { user } = useAuth();

  return useQuery<ProfileRow | null>({
    queryKey: profileQueryKey(user?.id ?? "anonymous"),
    queryFn: async () => {
      const client = getSupabaseBrowserClient();
      if (!client || !user) return null;
      return readOwnProfileWithRetry(client, user.id, { attempts: 2, delayMs: 400 });
    },
    enabled: user !== null,
    staleTime: 30_000,
  });
}
