# Spacing and layout

## Spacing scale

Tailwind v4's default 4px base. Use only these steps: `1` (4) · `2` (8) · `3` (12) · `4` (16) · `5` (20) · `6` (24) · `8` (32) · `10` (40) · `12` (48).

| Use | Value |
|---|---|
| Page padding (desktop main) | 24 top, 32 sides and bottom (`pt-6 px-8 pb-8`); 24 all round in rail mode |
| Sidebar padding | 24 top/bottom, 16 sides |
| Gap between the header and content, and between the timeline panel and aside | 24 |
| Gap between aside cards | 16 |
| Panel/card padding | 20 (aside cards), 16 (compact cards) |
| Panel header rows | 12 vertical, 20 horizontal (habits row) |
| Between list rows / cards | 12 |
| Section label | 24 above, 8 below |
| Icon ↔ text | 8 (nav, buttons), 4 (tags) |

No other spacing values in feature code. Timeline geometry is computed and exempt.

## Layout containers

- **Root:** `flex min-h-dvh` with the sidebar (`flex-none basis-[248px]`) and main (`flex-1 min-w-0`). The root is the **container** for container queries (`@container`).
- **Content:** `w-full max-w-[1360px] mx-auto`. Do this as a named container class or a token once it is used twice; it is a layout constant, not a free value.
- **Today content row:** `flex flex-wrap gap-6 items-start`:
  - timeline panel `flex-[999_1_460px] min-w-0`;
  - aside `flex-[1_1_340px] max-w-[420px] min-w-0` (no max in rail mode).
- **Timeline scroll area:** fixed height 700, overflow-y auto.
- Never fix the page width. Never let the page scroll horizontally.

Express the fixed layout numbers (248, 80, 1360, 340, 420, 700) as named theme values or component constants, never as scattered literals.

## Component dimensions

Same ladder as mobile. Components that do the same job share a height.

| px | Components |
|---:|---|
| 64 | (phone tab bar, not used on desktop) |
| 56 | Week-strip day button (52 wide) |
| 52 | Primary button in dialogs/sheets |
| 48 | Capsule (width, and min height), fields, rail nav items |
| 44 | Sidebar **New task**, medium buttons (panel footer), steppers, delete icon button, minimum target |
| 40 | Icon buttons (week arrows), sidebar nav items, compact fields (aside capture), user avatar row |
| 36 | Chips, habit chips |
| 32 | Small chips (Plan, Add task), small icon buttons, segment buttons, Up next icons, avatar, inbox add button |
| 28 | Detail panel color swatches (sm) |
| 24 | Tags, check rings (hit area padded to 44), kind tag in the panel header |

## Density

- Desktop shows more at once but keeps phone spacing inside components. Extra width goes to the timeline text column and the aside, not to bigger type or padding.
- Cards: `bg-card rounded-card`, no border (aside cards and panels use `rounded-panel`). No shadows.
- List groups: one bordered container with hairline-separated rows (min 44, px 16).

## Alignment

- The sidebar logo, New task and nav icons share one left edge (padding 16 + item padding 12).
- Numbers right-aligned with `tabular-nums`.
- The timeline ring is centered on the capsule's first 48px, not the whole row.
