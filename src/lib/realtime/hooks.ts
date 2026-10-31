"use client";

/**
 * The three subscriptions the site actually needs, each with the filter from
 * handoff section 5. Each merges into the cache the matching query owns; nothing
 * here re-renders a component by itself.
 */
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { BetsResponse, MarketsResponse, MatchDetail } from "@/contract/contract";
import { queryKeys } from "@/lib/api/keys";
import { useTableChanges } from "./use-table-changes";
import {
  mergeBetRow,
  mergeMarketRow,
  mergeMatchRow,
  type BetRow,
  type MarketRow,
  type MatchRow,
} from "./merge";
import type { TableChange } from "./types";

/** Markets for one match, filtered by match_id. */
export function useMarketsRealtime(
  matchId: string | null,
  options: { enabled?: boolean } = {},
): void {
  const queryClient = useQueryClient();

  const onChange = useCallback(
    (change: TableChange) => {
      if (!matchId) return;
      if (change.eventType === "DELETE") return;
      const row = change.new as unknown as MarketRow;
      if (!row.selection_key) return;

      queryClient.setQueryData<MarketsResponse>(queryKeys.markets(matchId), (previous) =>
        mergeMarketRow(previous, row),
      );
    },
    [matchId, queryClient],
  );

  useTableChanges("markets", matchId ? `match_id=eq.${matchId}` : undefined, onChange, {
    enabled: Boolean(matchId) && (options.enabled ?? true),
    fallbackQueryKey: queryKeys.markets(matchId ?? ""),
  });
}

/** One match row: status, seed reveal, result. */
export function useMatchRealtime(matchId: string | null): void {
  const queryClient = useQueryClient();

  const onChange = useCallback(
    (change: TableChange) => {
      if (!matchId) return;
      const row = change.new as unknown as MatchRow;
      if (!row.id) return;

      queryClient.setQueryData<MatchDetail>(queryKeys.match(matchId), (previous) =>
        previous ? mergeMatchRow(previous, row) : previous,
      );
      // The lists carry the same row, so refresh them when the status moves.
      void queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    [matchId, queryClient],
  );

  useTableChanges("matches", matchId ? `id=eq.${matchId}` : undefined, onChange, {
    enabled: Boolean(matchId),
    fallbackQueryKey: queryKeys.match(matchId ?? ""),
  });
}

/** The signed-in player's own bets. RLS means only their rows arrive. */
export function useMyBetsRealtime(userId: string | null): void {
  const queryClient = useQueryClient();

  const onChange = useCallback(
    (change: TableChange) => {
      if (!userId) return;
      if (change.eventType === "DELETE") return;
      const row = change.new as unknown as BetRow;
      if (!row.id) return;

      queryClient.setQueryData<BetsResponse>(queryKeys.myBets(), (previous) =>
        mergeBetRow(previous, row),
      );
      // A settled bet moves money, so the wallet is stale now.
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet() });
    },
    [userId, queryClient],
  );

  useTableChanges("bets", userId ? `user_id=eq.${userId}` : undefined, onChange, {
    enabled: Boolean(userId),
    fallbackQueryKey: queryKeys.myBets(),
  });
}
