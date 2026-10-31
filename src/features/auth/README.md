# feature: auth

Supabase sign-in, the session, and the token every guarded call needs.

## Scope

- Email sign-in and sign-out. Session read on the server with the anon key.
- The access token goes to the API as `Authorization: Bearer <token>` on every
  `/api/me/*` call, and to the socket as the join option `{ token }`.
- A `401 missing_token` or `401 invalid_token` clears the session and sends the
  player back to sign-in.
- Self-exclusion state is displayed from `GET /api/me/limits`; while excluded the
  betting UI is hidden and the end date is shown.

## Status

Folder only. No code yet.

## How to test

Nothing to run yet. Later: sign in, confirm the token is attached to a wallet
call, sign out, confirm the token is gone and a guarded call answers 401.
