/**
 * The four values the browser needs, checked once.
 *
 * Next inlines NEXT_PUBLIC_ names at build time, so each one is read through a
 * literal `process.env.NEXT_PUBLIC_...` and never through a computed key. A
 * missing or malformed value never crashes the app silently: development renders
 * a full-page configuration error, production logs the same detail to the server
 * log and carries on with a clearly unusable client.
 *
 * Server-only values live in src/lib/server-env.ts, which starts with
 * `import "server-only"`.
 */
import { z } from "zod";

/** A URL that must actually parse, so a stray space is caught here and not later. */
const httpUrl = z
  .string()
  .trim()
  .min(1, "is empty")
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "must be an http(s) URL")
  .transform((value) => value.replace(/\/+$/, ""));

const socketUrl = z
  .string()
  .trim()
  .min(1, "is empty")
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "wss:" || url.protocol === "ws:";
    } catch {
      return false;
    }
  }, "must be a ws(s) URL")
  .transform((value) => value.replace(/\/+$/, ""));

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: httpUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().trim().min(40, "is too short to be an anon key"),
  NEXT_PUBLIC_API_BASE: httpUrl,
  /** Bare origin, no path: the Colyseus SDK appends its own matchmake paths. */
  NEXT_PUBLIC_SOCKET_URL: socketUrl,
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export const PUBLIC_ENV_NAMES = Object.keys(publicEnvSchema.shape) as Array<keyof PublicEnv>;

export interface EnvIssue {
  name: keyof PublicEnv;
  message: string;
}

export type EnvResult = { ok: true; env: PublicEnv } | { ok: false; issues: EnvIssue[] };

export type RawPublicEnv = Record<keyof PublicEnv, string | undefined>;

/** The raw values, read literally so the bundler can inline them. */
export function readRawPublicEnv(): RawPublicEnv {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  };
}

/**
 * Validates a raw env object. Values are never echoed in an issue: only the name
 * and the reason, so a log line can be pasted anywhere.
 */
export function validatePublicEnv(raw: Partial<RawPublicEnv>): EnvResult {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: raw.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: raw.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    NEXT_PUBLIC_API_BASE: raw.NEXT_PUBLIC_API_BASE ?? "",
    NEXT_PUBLIC_SOCKET_URL: raw.NEXT_PUBLIC_SOCKET_URL ?? "",
  });

  if (parsed.success) return { ok: true, env: parsed.data };

  const issues: EnvIssue[] = [];
  for (const issue of parsed.error.issues) {
    const name = issue.path[0];
    if (typeof name !== "string") continue;
    if (!(name in publicEnvSchema.shape)) continue;
    const key = name as keyof PublicEnv;
    if (!issues.some((entry) => entry.name === key)) {
      issues.push({ name: key, message: issue.message });
    }
  }
  return { ok: false, issues };
}

let cached: EnvResult | undefined;

/** The validated env, validated once per process. */
export function getPublicEnv(): EnvResult {
  cached ??= validatePublicEnv(readRawPublicEnv());
  return cached;
}

let logged = false;

/**
 * Production has no error page to show, so the failure goes to the server log
 * once, with names and reasons and no values, rather than throwing on import.
 */
export function reportEnvProblemsOnce(): void {
  if (logged) return;
  const result = getPublicEnv();
  if (result.ok) return;
  logged = true;
  const detail = result.issues.map((issue) => `${issue.name} ${issue.message}`).join("; ");
  console.error(`[env] configuration is incomplete: ${detail}`);
}

/** Test seam only. */
export function resetEnvCacheForTests(): void {
  cached = undefined;
  logged = false;
}
