# auth

Email and password only. No social providers, no phone, no magic links.

## What is here

| File                       | What it does                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `sign-up-form.tsx`         | email, username, password, the 18-and-policies checkbox, then the "check your email" screen with a 60 second resend |
| `sign-in-form.tsx`         | email and password, one generic refusal, a resend button only for an unconfirmed address                            |
| `forgot-password-form.tsx` | one answer whether or not the address exists                                                                        |
| `reset-password-form.tsx`  | the new password, once the recovery session exists                                                                  |
| `account-menu.tsx`         | the balance chip, the avatar button and its four links                                                              |
| `me-screen.tsx`            | the `/me` panels: account, then responsible play                                                                    |
| `self-exclusion-panel.tsx` | the five durations and the confirmation that cannot be undone                                                       |
| `use-profile.ts`           | the player's own `profiles` row, read under RLS                                                                     |
| `use-resend-cooldown.ts`   | the resend button's 60 seconds                                                                                      |
| `form-parts.tsx`           | label above, 12px helper, error below with an icon and text                                                         |

The rules the forms enforce live in `src/lib/auth`: `schemas.ts` (Zod),
`redirect.ts` (`safeNextPath`), `errors.ts` (what a player is told), `profile.ts`
(the trigger's row and its retry) and `middleware-decision.ts` (the redirect rules,
as a pure function). `middleware.ts` at the repo root refreshes the session and
applies that decision.

## Decisions worth knowing

- **The username is a request, not a promise.** The database trigger strips anything
  but letters, numbers and underscore, lowercases it, and appends a number when the
  name is taken. The browser cannot read other players' rows, so availability cannot
  be checked here. The form says so, and the assigned name is shown in a toast after
  sign-up, read from `profiles` with up to three reads 500 ms apart.
- **No account enumeration.** Wrong credentials get one line. Forgot password always
  answers the same. The only distinct cases are the ones Supabase already told the
  player: unconfirmed email, rate limiting, a dead reset link.
- **One provider.** `AuthProvider` exposes `user`, `session`, `loading`, `refresh`
  and `signOut`, hands the API client its bearer token, and clears the TanStack
  Query cache on sign in and sign out.
- **`next` is re-checked in the callback route**, not only in the middleware, so a
  crafted link cannot use the email flow as an open redirect.
- **The balance chip shows zeros.** A new player's wallet really is zero. The chip
  hides only while the wallet read is pending, which is also what a waking game
  server looks like from the browser.

## How to test

```bash
npx vitest run src/lib/auth src/features/auth
```

The suites cover the Zod rules (2 and 21 characters, uppercase, symbols, the
checkbox), `safeNextPath` (absolute, protocol-relative, backslash, encoded and
control-character tricks), the middleware decision (signed out to a protected page
carries `next`, signed in leaves `/sign-in`), the sign-up flow with and without a
returned session, the sign-in message mapping, and the self-exclusion dialog
sending the hours each duration means.

The Supabase client is mocked in every test: no network, no project, no session.

## What the site depends on in Supabase

- Email provider enabled, and **Confirm email** either on (the site handles the
  "check your email" screen) or off (sign-up returns a session and goes straight in).
- An email template whose link points at `{{ .SiteURL }}/auth/callback`; the
  redirect allowlist must contain the site origin and `http://localhost:3000`.
- The `profiles` trigger on `auth.users` that reads `user_metadata.username`.
- RLS on `profiles` with a self-read policy (`id = auth.uid()`).
- A recovery template for `/reset-password` through the same callback.
