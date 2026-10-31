# Strikezone website

The public site for Strikezone, a Carrom and Ludo skill-game betting platform.
Next.js App Router, TypeScript strict, Tailwind on design tokens.

- Live site: https://strikezone-bet.vercel.app
- Game and betting server: https://github.com/wisdom-technologies-bit/strikezone-server
- Server base URL: https://strikezone-server-ex45.onrender.com
- Realtime socket: `wss://strikezone-server-ex45.onrender.com` (bare origin, no path)

## Read first

- [AI_RULES.md](./AI_RULES.md) - stack, structure and the ten hard rules.
- `src/contract/contract.ts` - the server's contract file, copied verbatim. Do not
  edit it; the header names the source commit.

## Layout

```
src/app               routes
src/components/ui     design system (see its README for the inventory)
src/components/shell  top bar, rail, tab bar, notice strip
src/features/<name>   feature code, one README each
src/lib               api client, supabase, money, odds, stream, realtime
src/contract          verbatim server contract
src/styles/tokens.css every colour, size, radius, spacing and motion value
```

## Setup

```sh
npm install
cp .env.example .env.local   # fill in what you need; only NEXT_PUBLIC_ reaches the browser
npm run dev                  # http://localhost:3000
```

| Command                    | What it does                                                           |
| -------------------------- | ---------------------------------------------------------------------- |
| `npm run dev`              | Development server                                                     |
| `npm run build`            | Production build; must pass with no type errors                        |
| `npm run typecheck`        | `tsc --noEmit`                                                         |
| `npm run lint`             | ESLint, including no default exports outside Next's files and no `any` |
| `npm run format:check`     | Prettier                                                               |
| `npm test`                 | Vitest and Testing Library                                             |
| `npm run audit:mobile`     | 360px and 1280px audit against a running server                        |
| `npm run audit:lighthouse` | Lighthouse mobile on `/` and `/dev/ui`                                 |
| `npm run contract:check`   | Compares `src/contract/contract.ts` with the server repo               |

## Design tokens

One file: `src/styles/tokens.css`, mapped into Tailwind by `tailwind.config.ts`.
Components carry no raw colour and no arbitrary pixel value; they use the tokens.
For the same reason, `src/lib/cn.ts` teaches `tailwind-merge` our token names, so
`text-ink-inverse` and `text-body` are not treated as the same group and silently merged.

Surfaces `--surface-0` `#0A0F1A` (page), `--surface-1` `#0F1626` (panels),
`--surface-2` `#151D30` (raised, hover). Borders `--border` `#1F2A42`,
`--border-strong` `#2B3A5A`. Text `--text` `#E7EBF3`, `--text-muted` `#94A0B8`,
`--text-faint` `#7A869F`. Accent `--brass-500` `#C8A24A`, `--brass-600` `#A8852F`,
`--brass-tint` `rgba(200,162,74,0.12)`. Status `--win` `#2CBFA6`, `--loss` `#E5586D`,
`--warn` `#E0A93B`, `--info` `#5B8DEF`, each with a 12 percent tint.

Radii 4px controls, 6px panels. Density: 13/18 body, 12/16 small, 11/14 micro,
14 semibold section titles; controls 28, 32 and 36 tall; 4px spacing scale; gutter 12px
below 1024 and 16px above. Motion 120 to 160ms `ease-out`; `prefers-reduced-motion`
collapses it to zero. One shadow exists, for sheets and dialogs only.

### Contrast

Measured with the WCAG 2.1 relative-luminance formula. 32 pairs, no failures. The same
table is rendered at `/dev/ui` straight from `src/lib/contrast-table.ts`.

**Text on surfaces**

| Pair                   | Foreground | Background | Ratio   | AA  |
| ---------------------- | ---------- | ---------- | ------- | --- |
| text / surface-0       | `#E7EBF3`  | `#0A0F1A`  | 16.03:1 | AA  |
| text-muted / surface-0 | `#94A0B8`  | `#0A0F1A`  | 7.28:1  | AA  |
| text-faint / surface-0 | `#7A869F`  | `#0A0F1A`  | 5.23:1  | AA  |
| text / surface-1       | `#E7EBF3`  | `#0F1626`  | 15.11:1 | AA  |
| text-muted / surface-1 | `#94A0B8`  | `#0F1626`  | 6.86:1  | AA  |
| text-faint / surface-1 | `#7A869F`  | `#0F1626`  | 4.93:1  | AA  |
| text / surface-2       | `#E7EBF3`  | `#151D30`  | 14.06:1 | AA  |
| text-muted / surface-2 | `#94A0B8`  | `#151D30`  | 6.38:1  | AA  |
| text-faint / surface-2 | `#7A869F`  | `#151D30`  | 4.59:1  | AA  |

**Accent**

| Pair                     | Foreground | Background | Ratio  | AA  |
| ------------------------ | ---------- | ---------- | ------ | --- |
| brass-500 / surface-0    | `#C8A24A`  | `#0A0F1A`  | 7.96:1 | AA  |
| brass-500 / surface-1    | `#C8A24A`  | `#0F1626`  | 7.5:1  | AA  |
| brass-500 / surface-2    | `#C8A24A`  | `#151D30`  | 6.98:1 | AA  |
| brass-600 / surface-1    | `#A8852F`  | `#0F1626`  | 5.21:1 | AA  |
| text-inverse / brass-500 | `#0A0F1A`  | `#C8A24A`  | 7.96:1 | AA  |
| text-inverse / brass-600 | `#0A0F1A`  | `#A8852F`  | 5.53:1 | AA  |
| brass-500 / brass tint   | `#C8A24A`  | `#25272A`  | 6.22:1 | AA  |

**Status on surfaces**

| Pair             | Foreground | Background | Ratio  | AA  |
| ---------------- | ---------- | ---------- | ------ | --- |
| win / surface-1  | `#2CBFA6`  | `#0F1626`  | 7.83:1 | AA  |
| win / surface-2  | `#2CBFA6`  | `#151D30`  | 7.29:1 | AA  |
| loss / surface-1 | `#E5586D`  | `#0F1626`  | 5.11:1 | AA  |
| loss / surface-2 | `#E5586D`  | `#151D30`  | 4.76:1 | AA  |
| warn / surface-1 | `#E0A93B`  | `#0F1626`  | 8.52:1 | AA  |
| warn / surface-2 | `#E0A93B`  | `#151D30`  | 7.92:1 | AA  |
| info / surface-1 | `#5B8DEF`  | `#0F1626`  | 5.59:1 | AA  |
| info / surface-2 | `#5B8DEF`  | `#151D30`  | 5.2:1  | AA  |

**Status on tints**

| Pair                   | Foreground | Background | Ratio  | AA  |
| ---------------------- | ---------- | ---------- | ------ | --- |
| win / win tint         | `#2CBFA6`  | `#122A35`  | 6.47:1 | AA  |
| text-muted / win tint  | `#94A0B8`  | `#122A35`  | 5.67:1 | AA  |
| loss / loss tint       | `#E5586D`  | `#291E2F`  | 4.5:1  | AA  |
| text-muted / loss tint | `#94A0B8`  | `#291E2F`  | 6.04:1 | AA  |
| warn / warn tint       | `#E0A93B`  | `#282829`  | 6.95:1 | AA  |
| text-muted / warn tint | `#94A0B8`  | `#282829`  | 5.6:1  | AA  |
| info / info tint       | `#5B8DEF`  | `#18243E`  | 4.78:1 | AA  |
| text-muted / info tint | `#94A0B8`  | `#18243E`  | 5.86:1 | AA  |

### One token changed

`text-faint` was specified as `#66728A`. Measured against the surfaces it gives 3.96:1 on
`surface-0` and 3.47:1 on `surface-2`, under the 4.5:1 AA threshold for body text. It is
lifted to **`#7A869F`** (5.23 / 4.93 / 4.59), still clearly quieter than `text-muted`
`#94A0B8` (6.38 at worst). Nothing else had to move: every other text pair already passed,
including `text-muted` on the status tints (5.60:1 at worst) and `text-inverse` on brass
(7.96:1).

`text-faint` stays reserved for labels that carry no meaning alone, and is never placed on
a status tint (it drops to about 4.0:1 there; use `text-muted`, which holds 5.6:1).

## Status

The design system and the app shell are built. Every route exists and carries its title;
none has product content yet. No API call, no auth and no realtime connection is wired.
The balance chip and the Sign in control are placeholders and say so.

## Quality checks (latest run)

- `npm run build`: passes, no type errors, no `any`.
- `npm test`: 18 tests in 4 files, all passing.
- `npm run audit:mobile`: all 14 route/viewport combinations pass - no horizontal scroll at
  360px, nothing outside the viewport, tap targets at or above the floor for the pointer.
- Lighthouse mobile on a production build:

| Page      | Performance | Accessibility | Best practices | SEO |
| --------- | ----------- | ------------- | -------------- | --- |
| `/`       | 100         | 100           | 100            | 100 |
| `/dev/ui` | 97          | 100           | 100            | 60  |

The 60 on the gallery is `is-crawlable`: `/dev/ui` sends `noindex, nofollow` on purpose.

## Layout notes

- **Tap targets.** Rule 8 wants 36px. Below 1024px every `.tap-target` gets a 36px minimum
  height whatever the drawn size, so 28/32/36 is a desktop-only density. A switch or a
  checkbox keeps its 20px or 16px drawing inside a larger button, so the hit area grows and
  the drawing does not.
- **Pointer floor.** On a mouse viewport the audit enforces the WCAG 2.5.8 AA target size
  (24px) rather than 36, because dense 28px controls are the point of the design.
- **Field borders** are inset shadows (`.field-surface`), so the input fills the whole
  control and the border is not a dead 1px strip at the edge.
- **Tables** scroll inside their own box at 360px. That is the only horizontal scroll in the
  product and it never moves the page.

## Routes

| Route                                                    | State                                    |
| -------------------------------------------------------- | ---------------------------------------- |
| `/`                                                      | Title only                               |
| `/live`, `/tournaments`, `/wallet`, `/bets`, `/fairness` | Title only                               |
| `/dev/ui`                                                | Design system gallery, 404 in production |
| `/dev/data`                                              | Data layer probe, 404 in production      |

## The data layer

The browser talks to the game server through one wrapper, and every response is parsed by a
schema from `src/contract` before a component can see it. A protocol change fails at the
boundary with a `ContractMismatchError` naming the route, rather than rendering half a page.

| Concern      | Where                          | Behaviour                                                                                                       |
| ------------ | ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Fetching     | `src/lib/api/client.ts`        | 15s timeout, GET retried twice with backoff, POST never retried, errors normalised to status + code             |
| Routes       | `src/lib/api/endpoints.ts`     | Every public and user route from the handoff, one function each                                                 |
| Reads        | `src/lib/api/queries.ts`       | Per-data staleness; user queries disabled until there is a session                                              |
| Cold start   | `src/lib/api/server-status.ts` | A request slower than 4s, or a 502/503/504, raises the waking notice and polls `/health` every 3s for up to 90s |
| Live updates | `src/lib/realtime/`            | One channel per table and filter, merged into the query cache; polling after 5s if the channel does not join    |
| Spectating   | `src/lib/stream/`              | Bare origin, contract-decoded frames, reconnect with backoff, skipped shots counted                             |
| Money        | `src/lib/money.ts`             | Integer minor units, string arithmetic, currency and mode from `/api/config`                                    |
| Refusals     | `src/lib/errors/bet-errors.ts` | All 22 bet codes plus deposit and withdrawal blocks, in plain language                                          |

`/dev/data` shows the layer working: env names with a set/missing dot and no values, health
with a latency, the whole config, the three match lists, and one match's markets and stream.

### Environment

Copy `.env.example` to `.env.local`. The four public values are validated on first read; a
missing one shows a full configuration page in development and a log line in production.

| Name                            | Scope       | Used by                                                               |
| ------------------------------- | ----------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | browser     | Supabase client, Realtime                                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser     | Supabase client (RLS guards the data)                                 |
| `NEXT_PUBLIC_API_BASE`          | browser     | REST client                                                           |
| `NEXT_PUBLIC_SOCKET_URL`        | browser     | Colyseus, **bare origin, no path**                                    |
| `SUPABASE_SERVICE_ROLE_KEY`     | server only | future admin server actions                                           |
| `ADMIN_API_KEY`                 | server only | future admin server actions                                           |
| `ADMIN_ROUTE_SLUG`              | server only | the admin path; there is no `/admin`                                  |
| `GALLERY_PREVIEW`               | server      | `=1` exposes `/dev/ui` and `/dev/data` where they would otherwise 404 |

On Vercel, set the four `NEXT_PUBLIC_` values per environment. `NEXT_PUBLIC_SOCKET_URL` must be
the bare `wss://` origin or every spectator join answers 404 for a room that exists.

## Decisions worth a review

1. **`text-faint` lifted** to `#7A869F` for AA, as above.
2. **`/dev/ui` is 404 in production.** The guard evaluates per request (`force-dynamic`) so
   a static build cannot bake in the wrong answer. Lighthouse needs the real production
   rendering, so the page also accepts `GALLERY_PREVIEW=1`, an explicitly set flag that is
   not set on any deployed environment. Without it: 404, verified against `next start`.
3. **Skip link, switch and checkbox** gained hit areas rather than larger drawings.
4. **Placeholders are labelled.** The balance chip reads `0.00 XTS` from
   `src/lib/config.ts`, the one place `moneyMode` and `currency` are read until
   `GET /api/config` is wired. `currency` is never hardcoded in a component, so switching to
   `NGN` needs no component change. Sign in shows a toast saying it is not wired yet.
5. **Money is config, not a string.** `formatMoney(minor, config)` takes `{currency, moneyMode}`
   and `StakeInput` takes the same object, so `XTS` to `NGN` is a server change and not a
   component change. `parseMoney` is string arithmetic: `"0.29"` is 29, never 28.
6. **`odds_moved` is not a refusal.** `priceDirection` compares the price the player saw with
   the new one, and `needsConfirmationAgain` marks the code that asks again rather than
   apologising. `house_account_missing` and `escrow_account_missing` are named as server
   faults, because a retry cannot fix them.
7. **Only GET is retried.** A POST that timed out may have been applied; a bet retry reuses
   its idempotency key instead of guessing.
8. **Waking, not spinning.** A slow server raises a slim notice under the top bar and polls
   `/health`; the page does not hold a request open for a minute in silence.
9. **`/dev/data` reads only.** It proves the layer against the live server without a write
   path, and it is 404 in production unless `GALLERY_PREVIEW=1` is deliberately set.
