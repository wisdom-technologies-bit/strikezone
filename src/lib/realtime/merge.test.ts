import { describe, expect, it } from "vitest";
import type { BetsResponse, matchDetailSchema, MarketsResponse } from "@/contract/contract";
import type { z } from "zod";
import { mergeBetRow, mergeMarketRow, mergeMatchRow, type MarketRow } from "./merge";
import { isBrieflyNoBetting, marketStatusLabel } from "./types";

type MatchDetail = z.infer<typeof matchDetailSchema>;

const row = (overrides: Partial<MarketRow> = {}): MarketRow => ({
  id: "row-1",
  match_id: "m1",
  market_type: "ludo_match_winner",
  subject: "",
  line: null,
  selection_key: "red",
  status: "open",
  odds_decimal: "3.64",
  max_stake_minor: 5000000,
  is_live: false,
  ...overrides,
});

const empty: MarketsResponse = { ok: true, matchId: "m1", markets: [] };

describe("market merge", () => {
  it("creates the market on the first selection and adds the next one to it", () => {
    const first = mergeMarketRow(empty, row());
    expect(first.markets).toHaveLength(1);
    expect(first.markets[0]?.selections).toEqual([
      { selectionKey: "red", oddsDecimal: 3.64, status: "open" },
    ]);

    const second = mergeMarketRow(
      first,
      row({ id: "row-2", selection_key: "green", odds_decimal: "2.1" }),
    );
    expect(second.markets).toHaveLength(1);
    expect(second.markets[0]?.selections).toHaveLength(2);
    expect(second.markets[0]?.selections[1]).toEqual({
      selectionKey: "green",
      oddsDecimal: 2.1,
      status: "open",
    });
  });

  it("replaces the price of a selection that already exists", () => {
    const first = mergeMarketRow(empty, row());
    const repriced = mergeMarketRow(first, row({ odds_decimal: "4.2" }));
    expect(repriced.markets[0]?.selections[0]?.oddsDecimal).toBe(4.2);
    expect(repriced.markets[0]?.selections).toHaveLength(1);
  });

  it("marks the market suspended while one of its selections is", () => {
    const two = mergeMarketRow(
      mergeMarketRow(empty, row()),
      row({ id: "r2", selection_key: "blue" }),
    );
    const suspended = mergeMarketRow(two, row({ status: "suspended" }));
    expect(suspended.markets[0]?.status).toBe("suspended");

    const reopened = mergeMarketRow(suspended, row({ status: "open" }));
    expect(reopened.markets[0]?.status).toBe("open");
  });

  it("keeps a settled market settled", () => {
    const settled = mergeMarketRow(mergeMarketRow(empty, row()), row({ status: "settled" }));
    expect(settled.markets[0]?.status).toBe("settled");
  });

  it("keeps a separate market for a different line", () => {
    const base = mergeMarketRow(empty, row());
    const other = mergeMarketRow(
      base,
      row({ id: "r3", market_type: "ludo_total_turns", line: 60.5 }),
    );
    expect(other.markets).toHaveLength(2);
  });
});

describe("match merge", () => {
  const detail: MatchDetail = {
    id: "m1",
    game: "ludo",
    status: "live",
    tournamentId: null,
    isTournament: false,
    startedAt: "2026-10-31T10:00:00.000Z",
    endedAt: null,
    players: [],
    scores: null,
    roomId: "m1",
    seedCommit: "abc",
    seedReveal: null,
    resultSignature: null,
    logHeadHash: null,
    result: null,
  };

  it("takes the new status and ignores a row for another match", () => {
    const settled = mergeMatchRow(detail, { id: "m1", status: "finished", seed_reveal: "def" });
    expect(settled?.status).toBe("finished");
    expect(settled?.seedReveal).toBe("def");

    expect(mergeMatchRow(detail, { id: "m2", status: "finished" })).toBe(detail);
  });
});

describe("bet merge", () => {
  it("adds a new bet at the top and updates a known one in place", () => {
    const emptyBets: BetsResponse = { ok: true, bets: [], nextCursor: null };
    const placed = mergeBetRow(emptyBets, {
      id: "b1",
      market_id: "mk1",
      stake_minor: 10000,
      odds_locked: "3.64",
      status: "open",
      potential_payout_minor: 36400,
      payout_minor: null,
      placed_at: "2026-10-31T10:00:00.000Z",
      settled_at: null,
      match_id: "m1",
    });
    expect(placed.bets[0]?.status).toBe("open");

    const settled = mergeBetRow(placed, {
      id: "b1",
      market_id: "mk1",
      stake_minor: 10000,
      odds_locked: 3.64,
      status: "won",
      potential_payout_minor: 36400,
      payout_minor: 36400,
      placed_at: "2026-10-31T10:00:00.000Z",
      settled_at: "2026-10-31T10:05:00.000Z",
    });
    expect(settled.bets).toHaveLength(1);
    expect(settled.bets[0]?.status).toBe("won");
    expect(settled.bets[0]?.payoutMinor).toBe(36400);
  });
});

describe("market status wording", () => {
  it("treats closed and suspended as no betting, not as an error", () => {
    expect(isBrieflyNoBetting("closed")).toBe(true);
    expect(isBrieflyNoBetting("suspended")).toBe(true);
    expect(isBrieflyNoBetting("open")).toBe(false);
    expect(marketStatusLabel("closed")).toBe("Closed");
  });
});
