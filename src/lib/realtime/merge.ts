/**
 * Folding a Realtime row into what is already cached.
 *
 * Supabase sends one row per change; the API returns a nested shape (a market
 * with its selections, a match with its players). These functions are pure so the
 * merge can be tested against the exact rows the server writes.
 *
 * A row that has no place yet is ignored rather than invented: the next poll or
 * the first fetch puts it there. Markets are the exception, since a new market is
 * a new price the player can act on.
 */
import type { Bet, BetsResponse, Market, MarketsResponse, MatchDetail } from "@/contract/contract";
import type { MarketStatus } from "./types";

/** The contract's market status has no "closed": in-play it means suspended. */
type ContractMarketStatus = "open" | "suspended" | "settled" | "void";

function toContractStatus(status: MarketStatus): ContractMarketStatus {
  return status === "closed" ? "suspended" : status;
}

export interface MarketRow {
  id: string;
  match_id: string;
  market_type: string;
  subject: string | null;
  line: number | null;
  selection_key: string;
  status: MarketStatus;
  odds_decimal: number | string;
  max_stake_minor: number | null;
  is_live: boolean;
}

function asNumber(value: number | string): number {
  return typeof value === "number" ? value : Number(value);
}

function sameMarket(market: Market, row: MarketRow): boolean {
  return (
    market.marketType === row.market_type &&
    market.subject === (row.subject ?? "") &&
    (market.line ?? null) === (row.line ?? null)
  );
}

/** Inserts or updates one selection, leaving every other market untouched. */
export function mergeMarketRow(
  previous: MarketsResponse | undefined,
  row: MarketRow,
): MarketsResponse {
  const markets = previous?.markets ?? [];
  const index = markets.findIndex((market) => sameMarket(market, row));

  const selection = {
    selectionKey: row.selection_key,
    oddsDecimal: asNumber(row.odds_decimal),
    status: toContractStatus(row.status),
  };

  if (index === -1) {
    const created: Market = {
      id: row.id,
      marketType: row.market_type,
      subject: row.subject ?? "",
      line: row.line ?? null,
      name: row.market_type,
      status: toContractStatus(row.status),
      maxStakeMinor: row.max_stake_minor ?? null,
      isLive: row.is_live,
      selections: [selection],
    };
    return { ok: true, matchId: previous?.matchId ?? row.match_id, markets: [...markets, created] };
  }

  const existing = markets[index];
  if (!existing) return previous ?? { ok: true, matchId: row.match_id, markets: [] };

  const selectionIndex = existing.selections.findIndex(
    (entry) => entry.selectionKey === row.selection_key,
  );
  const selections =
    selectionIndex === -1
      ? [...existing.selections, selection]
      : existing.selections.map((entry, position) =>
          position === selectionIndex ? selection : entry,
        );

  const updated: Market = {
    ...existing,
    // The market's own status is the strictest of its selections: one suspended
    // alternative means the market is not fully open.
    status:
      row.status === "settled" || row.status === "void"
        ? row.status
        : selections.some((entry) => entry.status === "suspended")
          ? "suspended"
          : "open",
    isLive: row.is_live,
    maxStakeMinor: row.max_stake_minor ?? existing.maxStakeMinor,
    selections,
  };

  const next = markets.map((market, position) => (position === index ? updated : market));
  return { ok: true, matchId: previous?.matchId ?? row.match_id, markets: next };
}

export interface MatchRow {
  id: string;
  status?: MatchDetail["status"];
  started_at?: string | null;
  ended_at?: string | null;
  seed_commit?: string | null;
  seed_reveal?: string | null;
  result?: unknown;
}

/** Only the fields the header shows; players and scores come from the poll. */
export function mergeMatchRow(
  previous: MatchDetail | undefined,
  row: MatchRow,
): MatchDetail | undefined {
  if (!previous || previous.id !== row.id) return previous;
  return {
    ...previous,
    status: row.status ?? previous.status,
    startedAt: row.started_at ?? previous.startedAt,
    endedAt: row.ended_at ?? previous.endedAt,
    seedCommit: row.seed_commit ?? previous.seedCommit,
    seedReveal: row.seed_reveal ?? previous.seedReveal,
    result: (row.result as MatchDetail["result"]) ?? previous.result,
  };
}

export interface BetRow {
  id: string;
  market_id: string;
  stake_minor: number;
  odds_locked: number | string;
  status: Bet["status"];
  potential_payout_minor: number;
  payout_minor: number | null;
  placed_at: string;
  settled_at: string | null;
  result?: string | null;
  match_id?: string;
  user_id?: string;
}

/** Adds a bet that is not in the list yet, or replaces it in place. */
export function mergeBetRow(
  previous: BetsResponse | undefined,
  row: BetRow,
  marketType = "",
): BetsResponse {
  const bets = previous?.bets ?? [];
  const index = bets.findIndex((bet) => bet.id === row.id);

  const next: Bet =
    index === -1
      ? {
          id: row.id,
          matchId: row.match_id ?? "",
          marketId: row.market_id,
          marketType,
          selectionKey: "",
          stakeMinor: row.stake_minor,
          oddsLocked: asNumber(row.odds_locked),
          potentialPayoutMinor: row.potential_payout_minor,
          status: row.status,
          payoutMinor: row.payout_minor,
          placedAt: row.placed_at,
          settledAt: row.settled_at,
        }
      : {
          ...bets[index]!,
          status: row.status,
          payoutMinor: row.payout_minor,
          settledAt: row.settled_at,
        };

  const updated =
    index === -1 ? [next, ...bets] : bets.map((bet, position) => (position === index ? next : bet));
  return { ok: true, bets: updated, nextCursor: previous?.nextCursor ?? null };
}
