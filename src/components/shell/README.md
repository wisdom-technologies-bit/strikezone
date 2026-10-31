# App shell

The frame every route renders inside: fixed top bar, virtual-money notice strip, a
collapsible rail from 1024px, a 52px tab bar below that, and the slot the bet slip will
occupy above it.

- `top-bar` - wordmark, balance chip (mono, from `GET /api/config` currency), Sign in.
- `notice-strip` - only renders when `moneyMode` is `virtual`: "No real money. Stakes and
  payouts here are virtual." It has its own row so it cannot crowd the top bar at 360px.
- `rail` - 48px icons collapsed, 200px expanded with labels; the choice is saved in
  `localStorage` and a failed write is ignored.
- `tab-bar` - Home, Live, Tournaments, Wallet, Me; one item per tab, no overflow at 360.
- `bet-slip-slot` - reserved height so scroll padding and the tab bar are already right.
- `page-heading` - the one place a route title is drawn.

The rail and tab bar are driven by `src/lib/routes.ts`, so a new section is one entry.

## How to test

```sh
npm run dev
# 360px: tab bar visible, rail hidden, notice strip readable, no horizontal scroll
# 1280px: rail visible; collapse it, reload, it stays collapsed
npm run audit:mobile
```
