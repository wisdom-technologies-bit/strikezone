"use client";

/**
 * The reads the site makes, as hooks.
 *
 * Staleness is chosen per data, not globally: the config changes rarely, a live
 * market does not, and a pre-match price is written once. A hook that needs a
 * session is disabled until there is one, so a signed-out browser never fires a
 * request that can only answer 401.
 */
import { useQuery } from "@tanstack/react-query";
import {
  getConfig,
  getLiveMatches,
  getMarkets,
  getMatch,
  getMyBets,
  getMyTransactions,
  getMyWallet,
  getRecentMatches,
  getUpcomingMatches,
} from "./endpoints";
import { queryKeys } from "./keys";
import { useSession } from "@/lib/supabase/use-session";

const MARKET_POLL_MS = 2_000;

export function useConfig() {
  return useQuery({
    queryKey: queryKeys.config(),
    queryFn: getConfig,
    staleTime: 5 * 60_000,
  });
}

export function useLiveMatches() {
  return useQuery({
    queryKey: queryKeys.matches("live"),
    queryFn: () => getLiveMatches({ limit: 20 }),
    staleTime: 10_000,
    refetchInterval: 20_000,
  });
}

export function useUpcomingMatches() {
  return useQuery({
    queryKey: queryKeys.matches("upcoming"),
    queryFn: () => getUpcomingMatches({ limit: 20 }),
    staleTime: 30_000,
  });
}

export function useRecentMatches() {
  return useQuery({
    queryKey: queryKeys.matches("recent"),
    queryFn: () => getRecentMatches({ limit: 20 }),
    staleTime: 30_000,
  });
}

export function useMatch(matchId: string | null) {
  return useQuery({
    queryKey: queryKeys.match(matchId ?? ""),
    queryFn: () => getMatch(matchId ?? ""),
    enabled: Boolean(matchId),
    staleTime: 15_000,
  });
}

/**
 * Markets, polled every two seconds while the match is live.
 *
 * The server has no push channel for prices, so this poll is the fallback; the
 * Realtime subscription is the faster path when it is working. A finished match
 * stops polling: its prices never change again.
 */
export function useMarkets(matchId: string | null, options: { isLive?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.markets(matchId ?? ""),
    queryFn: () => getMarkets(matchId ?? ""),
    enabled: Boolean(matchId),
    staleTime: MARKET_POLL_MS,
    refetchInterval: options.isLive ? MARKET_POLL_MS : false,
    refetchIntervalInBackground: false,
  });
}

export function useWallet() {
  const session = useSession();
  return useQuery({
    queryKey: queryKeys.wallet(),
    queryFn: getMyWallet,
    enabled: session.status === "signed-in",
    staleTime: 10_000,
  });
}

export function useMyBets() {
  const session = useSession();
  return useQuery({
    queryKey: queryKeys.myBets(),
    queryFn: getMyBets,
    enabled: session.status === "signed-in",
    staleTime: 15_000,
  });
}

export function useTransactions(limit = 20) {
  const session = useSession();
  return useQuery({
    queryKey: queryKeys.transactions(),
    queryFn: () => getMyTransactions({ limit }),
    enabled: session.status === "signed-in",
    staleTime: 15_000,
  });
}
