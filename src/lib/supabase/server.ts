import "server-only";

/**
 * The cookie-based server client, for server components and route handlers.
 *
 * Writes are swallowed on purpose: a server component cannot set a cookie, and
 * the session is refreshed in the middleware instead. The client still reads the
 * cookies it is given, which is what keeps a server render signed in.
 */
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getPublicEnv } from "@/lib/env";

export async function getSupabaseServerClient(): Promise<SupabaseClient | null> {
  const env = getPublicEnv();
  if (!env.ok) return null;

  const store = await cookies();

  return createServerClient(
    env.env.NEXT_PUBLIC_SUPABASE_URL,
    env.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(entries) {
          try {
            for (const { name, value, options } of entries) {
              store.set(name, value, options);
            }
          } catch {
            // Called from a server component: nothing to do, the middleware owns it.
          }
        },
      },
    },
  );
}
