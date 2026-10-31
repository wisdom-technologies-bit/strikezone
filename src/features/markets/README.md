# feature: markets

Markets and selections for a match, the stake entry, and the bet confirmation.

## Scope

- `GET /api/matches/:id/markets`, grouped by `marketType`, each with
  `subject`, `line`, `status`, `isLive` and `selections`.
- Odds through the single formatter in `src/lib/odds.ts`: two places, monospace
  tabular figures.
- `status: "suspended"` means temporarily no betting, not closed. On a live market
  `closed` and `suspended` are normal; refresh, do not error.
- Stakes are integers in minor units, between `minStakeMinor` from `/api/config`
  and the market's `maxStakeMinor`, and never above the player's own limit.
- Every bet sends `expectedOdds`. `odds_moved` shows the new price and asks again.
- Ludo seats map to colours red, green, yellow, blue in seat order 1 to 4.

## Status

Folder only. No code yet.

## How to test

Nothing to run yet. Later: price a market, place a bet, force an `odds_moved` and
confirm the new price is shown with a second confirmation rather than a silent
fill, and confirm a suspended market renders as unavailable without an error.
