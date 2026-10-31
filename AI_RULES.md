# AI_RULES.md

Rules for every task in this repository. They are not suggestions and they do not
expire. If a request conflicts with a rule here, say so before writing code.

## STACK

- Next.js (App Router), TypeScript strict, no any, no default exports except where Next requires them (pages, layouts, route handlers).
- Tailwind CSS with every color, size and spacing value coming from CSS variables defined once in the design tokens (created in the next task). No raw hex values or arbitrary pixel values in components.
- Radix UI primitives may be used for behavior (dialogs, tabs, tooltips). Every visual is styled with our tokens. Never ship a component library's default look.
- TanStack Query for server data, Zod for every external input, Vitest and Testing Library for logic and components.
- Fonts through next/font (self-hosted), never a runtime font request.

## STRUCTURE

- src/app (routes), src/components/ui (design system), src/features/<name> (feature code), src/lib (api client, supabase, money, stream, realtime), src/contract (a verbatim copy of the server's src/api/contract.ts; never edit it by hand, and put the source commit hash in a header comment).
- Each feature folder has a short README.md.

## HARD RULES

1. SECRETS: only NEXT_PUBLIC_ variables may be read in browser code. SUPABASE_SERVICE_ROLE_KEY and ADMIN_API_KEY are server-only, only read in files that start with import "server-only", and never referenced in any client component. Never log, print or commit a secret. Commit only .env.example, with names and placeholder values.
2. MONEY: every amount is an integer in minor units. Never use floating point for money. Format through one function in src/lib/money.ts. Read currency and moneyMode from GET /api/config; never hardcode XTS or NGN.
3. ODDS: format through one function in src/lib/odds.ts (decimal, 2 places, monospace tabular figures). Always send expectedOdds when placing a bet and handle odds_moved by showing the new price and asking again.
4. STREAM: decode all game frames only through src/contract. Join the Colyseus server with the bare origin, no path.
5. SERVER IS THE REFEREE: the browser never decides a game result, an outcome, a balance or a payout. It only displays what the server sends.
6. HONESTY IN THE UI: bots are always labeled as bots. Virtual-money mode shows a clear "test coins" notice. Show seed_commit before a match and seed_reveal after it. Odds, stakes and payouts are never rounded in the player's disfavour without being shown.
7. ADMIN: there is no /admin route. The admin area lives under a path taken from the server-only env var ADMIN_ROUTE_SLUG, is never linked from any public page, returns a plain 404 to everyone who is not a signed-in admin, and calls the game server with ADMIN_API_KEY only from server code (route handlers). Never forward the key to a browser.
8. MOBILE FIRST: design at 360px width first. No horizontal page scroll. Tap targets at least 36px tall.
9. UI STYLE: compact and dense, like a developer dashboard. No emoji, gradients, glow, glassmorphism, stock illustrations, centered hero banners, three-column feature grids or marketing language ("Welcome back!"). Sentence case. Motion 120 to 160 ms, ease-out, and respect prefers-reduced-motion. Colors meet WCAG AA contrast.
10. Small commits per task. Each task updates its feature README with what was added and how to test it.

## SOURCE OF TRUTH

`src/contract/contract.ts` is the server's own contract file, copied verbatim with
its source commit in the header. Do not edit it, patch it or "fix" a type in it.
To update it, copy the file from the server repository again and update the commit
hash in the header.

The server is the referee. Where this document and the contract disagree, the
contract wins; where the contract and the deployed API disagree, the deployed API
wins and the contract gets refreshed.
