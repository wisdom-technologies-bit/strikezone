# Design system

Every visual in Strikezone comes from here. Colours, sizes, radii and spacing come from
`src/styles/tokens.css` through `tailwind.config.ts`; no component carries a raw hex or an
arbitrary pixel value. Radix supplies behaviour only, and nothing keeps its default look.

See it all rendered, at real size, at `/dev/ui` (404 in production unless
`GALLERY_PREVIEW=1` is set at build time).

## What this task added

| Component                                       | Notes                                                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `button`                                        | `primary` (brass, inverse text), `secondary`, `ghost`, `danger`; sizes `sm` 28, `md` 32, `lg` 36; `disabled`, `loading` with a spoken label |
| `icon-button`                                   | Square icon control; `label` is required for the accessible name                                                                            |
| `input`                                         | Label, hint, error; border drawn as an inset shadow so the field fills the control                                                          |
| `stake-input`                                   | Integer minor units in, `onValueChange` in minor units out; quick amounts; min/max checked on blur and clamped                              |
| `select`                                        | Radix Select styled with our tokens                                                                                                         |
| `switch`, `checkbox`                            | Small drawing inside a larger hit area (36px touch, 28px desktop)                                                                           |
| `segmented-control`                             | Radio group with a sliding brass marker                                                                                                     |
| `tabs`                                          | Compact underline, counts, `aria-controls` wiring                                                                                           |
| `badge`                                         | `live`, `upcoming`, `open`, `suspended`, `won`, `lost`, `void`, `pending-review`, `bot`, `test-coins`                                       |
| `panel`, `stat`                                 | Panel, header, body, footer; dense stat pair                                                                                                |
| `table`                                         | Sticky header, mono tabular numerals, scrolls inside its own box                                                                            |
| `odds-button`                                   | Label left, price right in mono; `selected`, `suspended`, `disabled`; 600ms up/down flash with a polite live-region announcement            |
| `sheet`, `dialog`                               | Radix Dialog; bottom sheet at 360, side panel from 768                                                                                      |
| `toast`                                         | Single live region per screen, `role="status"`                                                                                              |
| `skeleton`, `spinner`, `empty-state`, `tooltip` | Loading and empty affordances                                                                                                               |
| `wordmark`, `icons`                             | Text wordmark in spaced brass; carrom and ludo drawn as SVG, stroke only                                                                    |
| `../shell/*`                                    | Top bar, notice strip, nav rail, mobile tab bar, bet slip slot                                                                              |

## Rules these components keep

- Money is an integer in minor units and is only formatted by `src/lib/money.ts`.
- Odds are only formatted by `src/lib/odds.ts`, always two places, mono tabular figures.
- Numbers use Geist Mono (`.num`), everything else Geist.
- No emoji, no gradients, no glow, no glass. One shadow, for overlays only.
- Motion is 120 to 160ms `ease-out` and is removed by `prefers-reduced-motion`.

## How to test

```sh
npm test                 # OddsButton, StakeInput, money, odds: 18 tests
npm run dev              # then open /dev/ui
npm run audit:mobile     # 360 and 1280 layout + tap targets, needs the dev server
```

When you add a component: add it to the gallery with every state, add a test if it has
logic, and update the table above.
