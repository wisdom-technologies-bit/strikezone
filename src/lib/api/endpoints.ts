/**
 * Every public and user route from docs/WEBSITE_HANDOFF.md section 3, typed.
 *
 * Components call these, never the client directly, so a route string exists in
 * exactly one place. Contract schemas come from src/contract; the four shapes the
 * contract does not describe come from ./schemas.
 */
import {
  betsResponseSchema,
  configSchema,
  leaderboardResponseSchema,
  marketSchema,
  marketsResponseSchema,
  matchResponseSchema,
  matchesResponseSchema,
  playerResponseSchema,
  tournamentResponseSchema,
  tournamentsResponseSchema,
  transactionsResponseSchema,
  walletResponseSchema,
  type BetsResponse,
  type ConfigResponse,
  type LeaderboardResponse,
  type Market,
  type MarketsResponse,
  type MatchDetail,
  type MatchesResponse,
  type PlayerProfile,
  type TournamentResponse,
  type TournamentsResponse,
  type TransactionsResponse,
  type WalletResponse,
} from "@/contract/contract";
import { createApiClient, type ApiClient, type QueryValue } from "./client";
import { NetworkError } from "./errors";
import { getPublicEnv } from "@/lib/env";
import { getAccessToken } from "./token";
import { markWaking } from "./server-status";
import {
  betPlacedResponseSchema,
  botsResponseSchema,
  depositResponseSchema,
  healthSchema,
  limitsResponseSchema,
  replayResponseSchema,
  selfExclusionResponseSchema,
  withdrawalResponseSchema,
  withdrawalsResponseSchema,
  type BetPlacedResponse,
  type BotsResponse,
  type Health,
} from "./schemas";
import type { z } from "zod";

let shared: ApiClient | undefined;

/** The app's client. Built once, from the validated base URL. */
export function getApi(): ApiClient {
  if (shared) return shared;
  const env = getPublicEnv();
  if (!env.ok) {
    throw new NetworkError("the API base URL is not configured");
  }
  const baseUrl = env.env.NEXT_PUBLIC_API_BASE;
  shared = createApiClient({
    baseUrl,
    getToken: getAccessToken,
    onWaking: () => {
      void markWaking(baseUrl);
    },
  });
  return shared;
}

/** Test seam: lets a test install a client built on a mocked fetch. */
export function setApiForTests(client: ApiClient | undefined): void {
  shared = client;
}

export interface MatchesQuery {
  limit?: number;
  cursor?: string;
  game?: "carrom" | "ludo";
  tournamentId?: string;
}

function matchQuery(query: MatchesQuery): Record<string, QueryValue> {
  return {
    limit: query.limit,
    cursor: query.cursor,
    game: query.game,
    tournamentId: query.tournamentId,
  };
}

async function get<T>(schema: z.ZodType<T>, route: string, query?: Record<string, QueryValue>) {
  return getApi().request(schema, route, { query });
}

// ---- Public ---------------------------------------------------------------

export const getHealth = (): Promise<Health> => get(healthSchema, "/health");

export const getConfig = (): Promise<ConfigResponse> => get(configSchema, "/api/config");

export const getBots = (): Promise<BotsResponse> => get(botsResponseSchema, "/api/bots");

export const getLiveMatches = (query: MatchesQuery = {}): Promise<MatchesResponse> =>
  get(matchesResponseSchema, "/api/matches/live", matchQuery(query));

export const getUpcomingMatches = (query: MatchesQuery = {}): Promise<MatchesResponse> =>
  get(matchesResponseSchema, "/api/matches/upcoming", matchQuery(query));

export const getRecentMatches = (query: MatchesQuery = {}): Promise<MatchesResponse> =>
  get(matchesResponseSchema, "/api/matches/recent", matchQuery(query));

export const getMatch = (id: string): Promise<MatchDetail> =>
  get(matchResponseSchema, `/api/matches/${encodeURIComponent(id)}`).then((body) => body.match);

export const getMarkets = (matchId: string): Promise<MarketsResponse> =>
  get(marketsResponseSchema, `/api/matches/${encodeURIComponent(matchId)}/markets`);

export const getReplay = (matchId: string) =>
  get(replayResponseSchema, `/api/matches/${encodeURIComponent(matchId)}/replay`);

export const getPlayer = (id: string): Promise<PlayerProfile> =>
  get(playerResponseSchema, `/api/players/${encodeURIComponent(id)}`).then((body) => body.player);

export const getLeaderboard = (limit = 25): Promise<LeaderboardResponse> =>
  get(leaderboardResponseSchema, "/api/leaderboard", { limit });

export const getTournaments = (): Promise<TournamentsResponse> =>
  get(tournamentsResponseSchema, "/api/tournaments");

export const getTournament = (id: string): Promise<TournamentResponse> =>
  get(tournamentResponseSchema, `/api/tournaments/${encodeURIComponent(id)}`);

// ---- The signed-in player -------------------------------------------------

export interface PlaceBetInput {
  marketId: string;
  stakeMinor: number;
  expectedOdds: number;
  idempotencyKey: string;
}

export function placeBet(input: PlaceBetInput): Promise<BetPlacedResponse> {
  return getApi().request(betPlacedResponseSchema, "/api/bets", {
    method: "POST",
    body: input,
  });
}

export const getMyBets = (): Promise<BetsResponse> => get(betsResponseSchema, "/api/me/bets");

export const getMyWallet = (): Promise<WalletResponse> =>
  get(walletResponseSchema, "/api/me/wallet");

export const getMyTransactions = (query: { limit?: number; cursor?: string } = {}) =>
  get(transactionsResponseSchema, "/api/me/transactions", {
    limit: query.limit,
    cursor: query.cursor,
  });

export const getMyLimits = () => get(limitsResponseSchema, "/api/me/limits");

export interface LimitsInput {
  dailyDepositLimitMinor?: number;
  dailyLossLimitMinor?: number;
  maxStakeMinor?: number;
}

export const updateMyLimits = (input: LimitsInput) =>
  getApi().request(limitsResponseSchema, "/api/me/limits", { method: "PUT", body: input });

export const selfExclude = (hours: number) =>
  getApi().request(selfExclusionResponseSchema, "/api/me/self-exclude", {
    method: "POST",
    body: { hours },
  });

export const createDeposit = (input: { amountMinor: number; provider?: string }) =>
  getApi().request(depositResponseSchema, "/api/deposits", { method: "POST", body: input });

export const createWithdrawal = (input: { amountMinor: number; destination?: string }) =>
  getApi().request(withdrawalResponseSchema, "/api/withdrawals", { method: "POST", body: input });

export const getWithdrawals = () => get(withdrawalsResponseSchema, "/api/withdrawals");

/**
 * The durations the profile page offers, in hours. The server accepts anything
 * from 1 to 8760 and only ever lengthens an exclusion.
 */
export const SELF_EXCLUSION_HOURS = [24, 168, 720, 2160, 8760] as const;
export type SelfExclusionHours = (typeof SELF_EXCLUSION_HOURS)[number];

// Re-exported for features that need the row types without the route.
export type { Market, BetsResponse, TransactionsResponse, WalletResponse };
export { marketSchema };
