# feature: bets

The player's own bets, open and settled.

## Scope

- `GET /api/me/bets`, and Realtime on `bets` filtered by the player's own user id.
- Each bet shows stake, locked odds, potential payout and status.
- `pending_review` reads as "under review", not "won", with no promised time.
- Void and settled bets show what the server settled, including a partial or lost
  result, without recomputing anything.
- Refusals are branched on the error code from the API, never on message text.

## Status

Folder only. No code yet.

## How to test

Nothing to run yet. Later: place a bet and confirm it appears from the API, then
from a Realtime insert, then settles in place without a manual refresh.
