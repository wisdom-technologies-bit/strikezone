# Routes

| Route          | File                   | State                                                                   |
| -------------- | ---------------------- | ----------------------------------------------------------------------- |
| `/`            | `page.tsx`             | Title only                                                              |
| `/live`        | `live/page.tsx`        | Title only                                                              |
| `/tournaments` | `tournaments/page.tsx` | Title only                                                              |
| `/wallet`      | `wallet/page.tsx`      | Title only                                                              |
| `/bets`        | `bets/page.tsx`        | Title only                                                              |
| `/fairness`    | `fairness/page.tsx`    | Title only                                                              |
| `/dev/ui`      | `dev/ui/page.tsx`      | Design system gallery; 404 in production                                |
| `icon.svg`     |                        | Favicon, carrom board, tokens inlined because a favicon cannot read CSS |

`layout.tsx` holds the fonts, metadata, skip link, toast and tooltip providers, and the app
shell. Every page is a server component until something needs state.

## Task 2 notes

All six product routes were created empty on purpose: this task built the design system and
the shell, not any screen. Each one draws only its title, so the shell is what you see.

There is no `/admin` route and there never will be: the admin area lives under
`ADMIN_ROUTE_SLUG` (rule 7).

## How to test

```sh
npm run build && npx next start -p 3000
curl -s -o /dev/null -w "%{http_code}" localhost:3000/dev/ui   # 404 in production
npm run dev
curl -s -o /dev/null -w "%{http_code}" localhost:3000/dev/ui   # 200 in development
```
