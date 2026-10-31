# src/features

One folder per feature. Each folder has its own README recording what was built
and how to test it, and each is updated by every task that touches it.

| Folder        | Scope                                                                 |
| ------------- | --------------------------------------------------------------------- |
| `auth`        | Supabase sign-in, session, the bearer token, sign-out, self-exclusion  |
| `matches`     | Lists (live, upcoming, recent), the match page, the live socket view   |
| `markets`     | Market and selection rendering, odds, stake entry, the odds-moved flow |
| `bets`        | The player's bets, open and settled, the pending-review wording        |
| `wallet`      | Balance, transactions, deposits, withdrawals, limits                   |
| `tournaments` | Tournament list, one tournament, its bracket                          |
| `admin`       | Server-only admin proxy under `/<ADMIN_ROUTE_SLUG>`                   |

Folders are created; no feature code exists yet.

## Rules that apply to every feature

- Feature code never imports another feature directly. Shared code moves to
  `src/lib` or `src/components/ui`.
- Data fetching through TanStack Query. Every external input through Zod.
- Bots labelled as bots, virtual money labelled as test coins, `seed_commit`
  before a match and `seed_reveal` after it.
- The server is the referee: no feature computes a result, a balance or a payout.

## How to test

Per feature, recorded in that feature's README. Until a feature exists, the check
is that `npm run typecheck` passes and nothing imports a server secret from a
client module.
