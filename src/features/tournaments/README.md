# feature: tournaments

The tournament list, one tournament, and its bracket.

## Scope

- `GET /api/tournaments` and `GET /api/tournaments/:id`.
- Realtime on `tournament_matches` filtered by `tournament_id` to show a slot
  filling and a match advancing.
- Each slot links to its match; a match that is part of a tournament shows that
  on its own page.

## Status

Folder only. No code yet.

## How to test

Nothing to run yet. Later: open a tournament, confirm the bracket matches
`tournament_matches`, and confirm a filled slot updates without a refresh.
