# src/lib

Shared code with no JSX. Every module here decodes or formats what the server sent; none of
them decides a result, a balance or a payout.

## Modules

| Module                    | What it does                                                                                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `env.ts`                  | Validates the four `NEXT_PUBLIC_` values with Zod. Development renders a full-page configuration error; production logs names and reasons, never values. `getPublicEnv()` caches the result for the process. |
| `server-env.ts`           | The three server secrets. Opens with `import "server-only"`, so a client import is a build error.                                                                                                            |
| `money.ts`                | `formatMoney(minor, config, options)` and `parseMoney(text)`. Integer minor units only, string arithmetic, currency and mode from `/api/config`. `XTS` renders as `12,345.67 XTS`, `NGN` as `₦12,345.67`.    |
| `odds.ts`                 | `formatOdds` (two places, always) and `priceDirection` for an odds-moved prompt. `potentialPayoutMinor` rounds down.                                                                                         |
| `api/client.ts`           | The typed fetch wrapper. Parses every response with a contract schema, 15s timeout, retries GET only (two attempts after the first), and marks the server waking after 4s or a gateway failure.              |
| `api/endpoints.ts`        | Every public and user route from the handoff, one function each.                                                                                                                                             |
| `api/queries.ts`          | The Query hooks, each with the staleness its data deserves. User routes stay disabled until there is a session.                                                                                              |
| `api/server-status.ts`    | The waking store. Polls `/health` every 3s for up to 90s, one poller for any number of failing requests.                                                                                                     |
| `api/errors.ts`           | `ApiError` (status + code), `ContractMismatchError` (route only, never the body), `NetworkError`.                                                                                                            |
| `api/token.ts`            | The seam that supplies the bearer token, filled once by the Query provider.                                                                                                                                  |
| `supabase/browser.ts`     | The browser client (anon key, under RLS) and `getSessionAccessToken`.                                                                                                                                        |
| `supabase/server.ts`      | The cookie-based server client. Server-only.                                                                                                                                                                 |
| `supabase/use-session.ts` | Who is signed in, if anyone. There are no auth screens yet.                                                                                                                                                  |
| `realtime/`               | One channel per table and filter, a per-event merge into the query cache, and polling if the channel does not join within 5s.                                                                                |
| `stream/`                 | The Colyseus spectator wrapper (bare origin, reconnect with backoff, lag counted) and `useMatchStream`.                                                                                                      |
| `errors/bet-errors.ts`    | Every bet, deposit and withdrawal refusal, in plain language.                                                                                                                                                |

## Rules that apply here

- Only `NEXT_PUBLIC_` variables in a browser module. Secrets live behind `import "server-only"`.
- One formatter per concern: money through `formatMoney`, odds through `formatOdds`.
- Frames are decoded only through `src/contract`. Nothing here reads a frame by hand.
- Only GET is retried. A POST that failed may have been applied; the caller decides.
- `npm run secrets:check` fails the build if a server-only name appears outside a server-only file.

## How to test

```sh
npx vitest run src/lib
```

`money` round trips 1000 seeded integers through `formatMoney` and back. `api/client` covers
retry, no-retry on POST, the slow mark, contract mismatch and the error envelope.
`realtime` covers each merge. `stream` stands a fake room in for Colyseus and covers connect,
snapshot, lag, reconnect, a refused room and leaving.
