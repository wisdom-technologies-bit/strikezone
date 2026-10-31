import { z } from "zod";

/**
 * A stub for GET /api/config, which the shell needs before the API client exists.
 * It mirrors the server's own shape (see src/contract) and is the only place the
 * shell reads money mode from. Replace the body with the real fetch; keep the
 * signature, and keep components reading `moneyMode` instead of assuming one.
 */

const configStubSchema = z.object({
  currency: z.string().length(3),
  moneyMode: z.enum(["virtual", "real"]),
});

export type PublicConfig = z.infer<typeof configStubSchema>;

const STUB = configStubSchema.parse({ currency: "XTS", moneyMode: "virtual" });

export function getPublicConfig(): PublicConfig {
  return STUB;
}
