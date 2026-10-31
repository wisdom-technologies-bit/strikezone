/**
 * The only place decimal odds become a string.
 *
 * Two places, always, so a column of prices lines up: 3.64, 1.10, 12.00.
 * Callers render the result in the mono font (see `.num`), which carries
 * tabular figures.
 */

const ODDS_PLACES = 2;

export function formatOdds(oddsDecimal: number): string {
  if (!Number.isFinite(oddsDecimal)) return "—";
  return oddsDecimal.toFixed(ODDS_PLACES);
}

/** The price the player saw against the price the server now offers. */
export function compareOdds(previous: number, next: number): "up" | "down" | "same" {
  if (next > previous) return "up";
  if (next < previous) return "down";
  return "same";
}

/** A stake and its price, to whole minor units, rounded down against the house. */
export function potentialPayoutMinor(stakeMinor: number, oddsDecimal: number): number {
  if (!Number.isFinite(oddsDecimal) || oddsDecimal <= 0) return 0;
  return Math.floor(stakeMinor * oddsDecimal + 1e-9);
}
