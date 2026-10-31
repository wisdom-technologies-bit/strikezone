# Routes

| Route          | File                   | State                                                                   |
| -------------- | ---------------------- | ----------------------------------------------------------------------- |
| `/`            | `page.tsx`             | Title only                                                              |
| `/live`        | `live/page.tsx`        | Title only                                                              |
| `/tournaments` | `tournaments/page.tsx` | Title only                                                              |
| `/wallet`      | `wallet/page.tsx`      | Title only                                                              |
| `/bets`        | `bets/page.tsx`        | Title only                                                              |
| `/fairness`    | `fairness/page.tsx`    | Title only                                                              |
| `/dev/ui`      | `dev/ui/page.tsx`      | Design system gallery and contrast table; 404 in production             |
| `/dev/data`    | `dev/data/page.tsx`    | Data layer probe: env, health, config, matches, stream                  |
| `icon.svg`     |                        | Favicon, carrom board, tokens inlined because a favicon cannot read CSS |

`layout.tsx` holds the fonts, metadata, skip link, the Query provider, the toast and tooltip
providers, and the app shell. It also decides what to do when the environment is invalid:
a full configuration page in development, a log line in production.

Every page is a server component until something needs state.

## The dev routes

Both dev routes are 404 unless `NODE_ENV` is development or `GALLERY_PREVIEW=1` is set, and
both decide per request (`force-dynamic`) so a static build cannot freeze the answer.

`/dev/data` is the data layer's own page: each public env name with a set/missing dot and no
value, `/health` with a latency, `/api/config` whole, the three match lists as counts, and one
match by id with its markets and a spectator stream behind a Connect button. It reads only.
The data behaviours are covered by unit tests against fixtures and mocks, not by this page
running in CI.

## There is no /admin

The admin area lives under `ADMIN_ROUTE_SLUG` (rule 7). There is no `/admin` route and there
never will be.

## How to test

```sh
npm run build && npx next start -p 3000
curl -s -o /dev/null -w "%{http_code}" localhost:3000/dev/ui     # 404 in production
curl -s -o /dev/null -w "%{http_code}" localhost:3000/dev/data   # 404 in production
GALLERY_PREVIEW=1 npx next start -p 3001                          # both answer 200 for Lighthouse
```
