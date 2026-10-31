# feature: wallet

Balance, transactions, deposits, withdrawals and limits.

## Scope

- `GET /api/me/wallet`: `availableMinor`, `atRiskMinor`, `pendingWithdrawalMinor`,
  `totalBalanceMinor`, and the `currency` it reports.
- Transactions from `GET /api/me/transactions`, paged by `cursor`.
- Deposits: `POST /api/deposits`. In virtual mode the deposit is credited and
  `credited` is true; in real mode redirect to `redirectUrl` and never credit the
  UI from the request alone.
- Withdrawals: `POST /api/withdrawals` answers `requested`. The money leaves
  available balance at request time, so it shows under `pendingWithdrawalMinor`.
- Limits: `GET`/`PUT /api/me/limits`, showing the `pending` period rather than
  pretending a tightened limit applied instantly.
- Virtual-money mode shows a clear test-coins notice.

## Status

Folder only. No code yet.

## How to test

Nothing to run yet. Later: read the wallet, place a bet and watch `atRiskMinor`
change, request a withdrawal and confirm it moves to `pendingWithdrawalMinor`, and
confirm every figure goes through the single money formatter.
