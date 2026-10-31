"use client";

/**
 * The player's own profiles row.
 *
 * The database trigger creates it when the auth user is created, so a fresh
 * sign-up can find it missing for a moment. One retry loop lives here, used by
 * the sign-up screen and by the profile query, so both behave the same way.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const PROFILE_COLUMNS =
  "username, display_name, role, kyc_status, self_excluded_until, created_at";

export interface ProfileRow {
  readonly username: string;
  readonly display_name: string | null;
  readonly role: string;
  readonly kyc_status: string;
  readonly self_excluded_until: string | null;
  readonly created_at: string;
}

export const PROFILE_RETRY_ATTEMPTS = 3;
export const PROFILE_RETRY_DELAY_MS = 500;

interface ProfileReadResult {
  readonly data: ProfileRow | null;
  readonly error: { readonly message: string } | null;
}

/** RLS is what makes `.eq("id", own id)` safe: another row is simply invisible. */
export async function readOwnProfile(
  client: SupabaseClient,
  userId: string,
): Promise<ProfileReadResult> {
  const { data, error } = await client
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  return { data: data ?? null, error: error === null ? null : { message: error.message } };
}

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Reads the row, waiting up to `attempts` times for the trigger to land.
 * Returns null when it still is not there: the caller shows "refresh in a moment"
 * rather than inventing a username.
 */
export async function readOwnProfileWithRetry(
  client: SupabaseClient,
  userId: string,
  options: { readonly attempts?: number; readonly delayMs?: number } = {},
): Promise<ProfileRow | null> {
  const attempts = options.attempts ?? PROFILE_RETRY_ATTEMPTS;
  const delayMs = options.delayMs ?? PROFILE_RETRY_DELAY_MS;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const result = await readOwnProfile(client, userId);
    if (result.data !== null) return result.data;
    if (attempt < attempts - 1) await wait(delayMs);
  }
  return null;
}
