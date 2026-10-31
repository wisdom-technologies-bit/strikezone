# src/app

Next.js App Router routes. Empty in this commit: no pages, layouts or route
handlers yet.

## What goes here

- `layout.tsx` and `page.tsx` for public pages: home, matches, a match page, the
  wallet, the player's bets.
- Route handlers (`route.ts`) for anything that needs a server secret: the
  admin proxy under `/<ADMIN_ROUTE_SLUG>`, which is the only place `ADMIN_API_KEY`
  and `SUPABASE_SERVICE_ROLE_KEY` may be read.
- No `app/admin` directory, ever. Admin routing comes from `ADMIN_ROUTE_SLUG`.

## Rules that apply here

- Default exports only where Next requires them (page, layout, route handlers,
  error and loading files). Everything else is a named export.
- Every external input (form body, search params, webhook payload) is parsed with
  Zod before use.
- Server components read `GET /api/config` for `currency` and `moneyMode`; no
  currency code is hardcoded in a route.

## How to test

Nothing to run yet. Once pages exist: `npm run dev`, then check 360px width first,
no horizontal scroll, and a plain 404 on any admin path that is not the slug.
