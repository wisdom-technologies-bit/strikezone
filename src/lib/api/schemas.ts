/**
 * The few response shapes the contract does not cover.
 *
 * The contract is copied verbatim from the server and is never edited here. Where
 * it has no schema (health, bots, replay, limits, deposits, withdrawals), the
 * shape below was read from the server's route handlers. Fields the site does not
 * read are left loose on purpose: a new server field must not break the client,
 * a missing one must.
 */
import { z } from "zod";

export const healthSchema = z.object({
  ok: z.literal(true),
  version: z.string(),
  uptimeSeconds: z.number().nonnegative(),
});
export type Health = z.infer<typeof healthSchema>;

export const botSchema = z.looseObject({
  level: z.string(),
  displayName: z.string(),
  policy: z.string(),
  isBot: z.literal(true),
});
export type Bot = z.infer<typeof botSchema>;

export const botsResponseSchema = z.object({ ok: z.literal(true), bots: z.array(botSchema) });
export type BotsResponse = z.infer<typeof botsResponseSchema>;

export const replaySeatSchema = z.looseObject({
  seat: z.number().int(),
  playerId: z.string().nullable(),
  displayName: z.string(),
  isBot: z.boolean(),
  botPolicy: z.string().nullable(),
});

export const replayVerificationSchema = z.looseObject({
  chainOk: z.boolean(),
  head: z.string().nullable(),
  reason: z.string().nullable(),
  seq: z.number().int().nullable(),
});

export const replaySchema = z.looseObject({
  id: z.string(),
  game: z.string(),
  status: z.string(),
  seedCommit: z.string().nullable(),
  seedReveal: z.string().nullable(),
  logHeadHash: z.string().nullable(),
  result: z.unknown().nullable(),
  resultSignature: z.string().nullable(),
  startedAt: z.string().nullable(),
  endedAt: z.string().nullable(),
  seats: z.array(replaySeatSchema),
});

export const replayResponseSchema = z.looseObject({
  ok: z.literal(true),
  match: replaySchema,
  events: z.array(z.unknown()),
  verification: replayVerificationSchema.nullable().optional(),
});

export const playerLimitsSchema = z.looseObject({
  dailyDepositLimitMinor: z.number().int().nullable(),
  dailyLossLimitMinor: z.number().int().nullable(),
  maxStakeMinor: z.number().int().nullable(),
});

export const limitsResponseSchema = z.looseObject({
  ok: z.literal(true),
  limits: playerLimitsSchema,
  pending: z.array(z.unknown()).optional(),
});

export const selfExclusionResponseSchema = z.looseObject({
  ok: z.literal(true),
  exclusion: z.looseObject({
    until: z.string().nullable().optional(),
    hours: z.number().int().optional(),
  }),
});

export const depositResponseSchema = z.looseObject({
  ok: z.literal(true),
  deposit: z.looseObject({ id: z.string() }),
  redirectUrl: z.string().nullable(),
  credited: z.boolean(),
});

export const withdrawalSchema = z.looseObject({
  id: z.string(),
  amountMinor: z.number().int(),
  status: z.string(),
  createdAt: z.string().optional(),
});

export const withdrawalResponseSchema = z.looseObject({
  ok: z.literal(true),
  withdrawal: withdrawalSchema,
});

export const withdrawalsResponseSchema = z.looseObject({
  ok: z.literal(true),
  withdrawals: z.array(withdrawalSchema),
});

export const betPlacedResponseSchema = z.looseObject({
  ok: z.literal(true),
  bet: z.looseObject({
    id: z.string(),
    marketId: z.string(),
    stakeMinor: z.number().int(),
    oddsLocked: z.number().positive(),
    potentialPayoutMinor: z.number().int(),
    status: z.string(),
    placedAt: z.string(),
  }),
  replayed: z.boolean(),
});
export type BetPlacedResponse = z.infer<typeof betPlacedResponseSchema>;

/** The error envelope, read loosely: a refusal may carry extra detail. */
export const errorEnvelopeSchema = z.looseObject({
  ok: z.literal(false),
  error: z.string(),
  message: z.string().optional(),
  issues: z.array(z.looseObject({ path: z.string(), message: z.string() })).optional(),
});
