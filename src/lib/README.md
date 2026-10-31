# src/lib

Shared, framework-free code. Empty in this commit; each module is listed with the
contract it has to keep.

## Planned modules

- `api.ts` - the REST client. One base URL from `NEXT_PUBLIC_API_BASE`, JSON in and
  out, the `{ok, error, issues}` envelope decoded, bearer token attached for
  `/api/me/*`, and the error code (not the message) surfaced to callers. Shows a
  waking-up state instead of a timeout on a cold start.
- `supabase.ts` - the browser client built from `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The service role client lives elsewhere and is
  server-only.
- `money.ts` - the single formatter for money. Integer minor units in, display
  string out, currency symbol and code passed in from `/api/config`. No float
  arithmetic anywhere in this file.
- `odds.ts` - the single formatter for decimal odds: two places, monospace tabular
  figures. Also the odds-moved comparison helper.
- `stream.ts` - the Colyseus client and the frame pipeline. Bare origin from
  `NEXT_PUBLIC_SOCKET_URL`, no path. Every frame decoded through `src/contract`.
- `realtime.ts` - the Supabase Realtime subscriptions, one channel per table and
  filter, covering only the tables the handoff allows.

## Rules that apply here

- Only `NEXT_PUBLIC_` variables may be read in a browser module. Secrets live in
  files that start with `import "server-only"`.
- No module here decides a result, a balance or a payout. They decode and format
  what the server sent.

## How to test

Pure functions (`money`, `odds`) get Vitest unit tests with the awkward cases:
zero, minimum stake, a large payout, a negative ledger amount, a suspended market.
`api` and `stream` get tests against recorded fixtures from the contract schemas.
