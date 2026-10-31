"use client";

/**
 * The browser Supabase client: the anon key, under RLS.
 *
 * One instance per tab, created lazily. No auth screens here; the session simply
 * exists or it does not, and everything user-scoped reads through it.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";

let cached: SupabaseClient | undefined;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (cached) return cached;
  const env = getPublicEnv();
  if (!env.ok) return null;

  cached = createBrowserClient(
    env.env.NEXT_PUBLIC_SUPABASE_URL,
    env.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return cached;
}

/** The bearer token for the API client, or null when nobody is signed in. */
export async function getSessionAccessToken(): Promise<string | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Test seam only. */
export function resetSupabaseBrowserClientForTests(): void {
  cached = undefined;
}
