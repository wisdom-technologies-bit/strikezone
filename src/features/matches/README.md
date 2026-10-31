# feature: matches

Match lists, the match page, and the live view of a match in progress.

## Scope

- Lists from `/api/matches/live`, `/api/matches/upcoming`, `/api/matches/recent`,
  paged with `cursor`, filtered by `game=carrom|ludo`.
- The match page from `/api/matches/:id`: players with bot labels, scores,
  `seedCommit` shown before play, `seedReveal` shown after the match ends.
- The live view: join the Colyseus room named by `roomId` on the bare origin with
  `{ matchId, spectate: true }`, handle `welcome`, `snapshot`, `shot`, `roll`,
  `move`, `match_end`, `lag` and `rejected`, and decode every frame through
  `src/contract`.
- Back off on a `lag` message and take the fresh `snapshot`; do not treat a
  spectator join rate limit as fatal.

## Status

Folder only. No code yet.

## How to test

Nothing to run yet. Later: open a live match, confirm the board updates from
server frames only, confirm a mid-match join gets `snapshot` then live frames, and
confirm `seed_reveal` appears only once the match finishes.
