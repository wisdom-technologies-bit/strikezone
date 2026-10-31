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
src/components/ui     design system
src/features/<name>   feature code, one README each
src/lib               api client, supabase, money, odds, stream, realtime
src/contract          verbatim server contract
```

## Status

Repository scaffolding only. No routes, no components, no design tokens yet.
`npm` is not set up in this commit; the Next.js scaffold lands in the next task.

## Setup

1. Copy `.env.example` to `.env.local` and fill in the values.
2. Nothing to run yet.

## Testing

No test runner is configured yet. Vitest and Testing Library arrive with the
scaffold. Each feature README records how to test that feature once it exists.
