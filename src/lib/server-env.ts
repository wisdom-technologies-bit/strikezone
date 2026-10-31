import "server-only";

/**
 * The two secrets and the admin path slug. Read here and nowhere else, in files
 * that open with `import "server-only"`, which makes an accidental client import
 * a build error rather than a leak.
 */
import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1, "is empty"),
  ADMIN_API_KEY: z.string().trim().min(1, "is empty"),
  ADMIN_ROUTE_SLUG: z
    .string()
    .trim()
    .min(4, "must be at least 4 characters")
    .regex(/^[a-z0-9-]+$/, "must be lowercase letters, digits and dashes"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export type ServerEnvResult =
  { ok: true; env: ServerEnv } | { ok: false; missing: Array<keyof ServerEnv> };

/** Validated server env. Never logged in full, never returned to a browser. */
export function getServerEnv(): ServerEnvResult {
  const parsed = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    ADMIN_API_KEY: process.env.ADMIN_API_KEY ?? "",
    ADMIN_ROUTE_SLUG: process.env.ADMIN_ROUTE_SLUG ?? "",
  });

  if (parsed.success) return { ok: true, env: parsed.data };

  const missing: Array<keyof ServerEnv> = [];
  for (const issue of parsed.error.issues) {
    const name = issue.path[0];
    if (typeof name === "string" && name in serverEnvSchema.shape) {
      const key = name as keyof ServerEnv;
      if (!missing.includes(key)) missing.push(key);
    }
  }
  return { ok: false, missing };
}
