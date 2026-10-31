/** Query keys, in one place, so a realtime merge and a hook cannot disagree. */
export const queryKeys = {
  config: () => ["config"] as const,
  matches: (scope: "live" | "upcoming" | "recent") => ["matches", scope] as const,
  match: (matchId: string) => ["match", matchId] as const,
  markets: (matchId: string) => ["markets", matchId] as const,
  wallet: () => ["wallet"] as const,
  myBets: () => ["my-bets"] as const,
  transactions: () => ["transactions"] as const,
} as const;
