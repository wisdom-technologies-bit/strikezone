# feature: admin

The back office. There is no `/admin` route in this site.

## Scope

- The admin area lives under a path read from the server-only env var
  `ADMIN_ROUTE_SLUG`. That path is never linked from any public page.
- Anyone who is not a signed-in admin gets a plain 404, not a 403, not a redirect
  and not a sign-in prompt.
- Admin data comes from the game server's `/api/admin/*` routes via our own route
  handlers. Those handlers hold `ADMIN_API_KEY`, add `x-admin-key`, and re-check
  that the caller is an admin before forwarding. The key never reaches a browser.
- Nothing here is prefetched, indexed or included in a public sitemap.

## Status

Folder only. No code yet.

## How to test

Nothing to run yet. Later: request `/admin` and get 404, request the configured
slug while signed out and get 404, sign in as a non-admin and get 404, sign in as
an admin and get the console. Confirm no bundle contains the admin key.
