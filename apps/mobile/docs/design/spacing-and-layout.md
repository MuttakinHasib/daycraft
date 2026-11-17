# Spacing and layout

## Spacing scale

Tailwind's default 4pt base (`--spacing: 0.25rem`, rem = 16). Use only these steps:

| Step | pt | Typical use |
|---|---:|---|
| `1` | 4 | Icon-to-text in tags, tiny nudges |
| `2` | 8 | Gaps inside chips and rows, meta row margin |
| `3` | 12 | Gap between cards, row-to-row minimum on the timeline, related elements |
| `4` | 16 | Card padding, standard gap, sheet section gaps (small) |
| `5` | 20 | **Page padding (phone)**, sheet horizontal padding |
| `6` | 24 | Section spacing, screen top inset, sheet body gaps |
| `8` | 32 | **Page padding (desktop)**, sheet footer bottom |
| `10` | 40 | Large layout spacing |
| `12` | 48 | Major separation |

No other values in feature code (no 6, 10, 14, 18, 22…). Two exceptions:

- Values inside primitives that the design system fixes (for example segmented padding 3, tag gap 4). They stay inside the primitive.
- Timeline geometry computed by the layout function.

`src/constants/theme.ts → Spacing` uses different names for a different scale. Do not use it (see [status](../status-and-decisions.md#template-leftovers-that-conflict-with-the-design-system)).

## Screen layout (phone)

| Region | Rule |
|---|---|
| Horizontal page padding | 20 (`px-5`) on every screen and sheet |
| Top of a tab root (Plan, Habits, Goals, More) | content starts 24 below the safe area |
| Sub-screen back row | 16 top, 14 side (the back chevron's own inset makes the text align with the 20 grid), height 40; title follows 4 below |
| Screen title → subtitle | 4 |
| Subtitle → first content | 8 |
| Section label | 24 above its group, 8 below |
| Between cards | 12 |
| Card padding | 16 (list-style cards with a leading ring: 12 vertical, 16 sides) |
| Scroll content bottom | 120 on tab screens: tab bar 64 + bottom inset 24 + 32 breathing room. Use the safe-area inset plus this, not a hardcoded total. |
| Floating tab bar | 16 from each side, 24 from the bottom (above the safe area). The + sits inside it, centered |
| + button | 64, 16 from the right, 24 from the bottom |
| Toast | 40 tall, 104 from the bottom (16 above the tab bar), max width = screen − 40 |

Use `react-native-safe-area-context`. Uniwind receives insets through `Uniwind.updateInsets` in `_layout.tsx`, so check the Uniwind docs for the safe-area utilities before hand-adding insets.

## Sheets

| Part | Spec |
|---|---|
| Corner radius | 30 top |
| Header (plain) | 20 top, 20 sides, 8 bottom; title `type-heading` + 40pt close |
| Header (hue band) | 16 top, 20 sides, 24 bottom; 40pt translucent buttons; 56pt icon circle (detail: 56×72 capsule); title input `type-heading` in white |
| Body | 20 sides; 16–20 top; section gap 24 (editor) or 16 (detail) |
| Footer | 12 top, 20 sides, 32 bottom; hairline top border; delete icon button 52 + primary button |
| Height | editor ≈ 94% of the screen (792 on 844); habit/routine 700; detail/month: content height, max ≈ 95% |

## Component dimensions

One ladder. Components that do the same job share a height.

| pt | Class | Components |
|---:|---|---|
| 64 | `h-16` | Floating tab bar |
| 52 | `h-13` | Primary/secondary buttons (sheet footers), list rows (min) |
| 48 | `h-12` | Inputs/fields, capsule (min, and width), subtask rows |
| 44 | `h-11` | Medium buttons (in cards), steppers, habit check button, mood circles, editor icon cells, **minimum touch target** |
| 40 | `size-10` | Icon buttons, habit card icon, project tile, back row |
| 36 | `h-9` | Chips, week-strip date circle, Inbox add button |
| 32 | `h-8` | Small chips (in cards and on the timeline), small icon buttons, segment buttons, color swatches, More tiles, agenda icon |
| 24 | `h-6` | Tags, check ring (with `hitSlop` 10 → 44 target), routine step numbers |

## Content density

- Lists and cards breathe at 12 gaps; never stack cards with no gap.
- Do not wrap a single row in a card if the screen already shows it as a list group.
- Cards: `bg-surface border border-line rounded-card`. No shadows.
- List groups: one card with hairline separators (`dk-list` / `dk-li` in the prototype). Rows are min 52 (48 for compact rows), with 16 side padding and 12 gaps.
- Use a horizontal scroll (habits row, filter chips, kanban, milestone tags) instead of wrapping when items are peers and order matters.

## Alignment

- Left edges align to the 20pt page grid. Icons in rows sit in a fixed-width slot so text columns line up.
- Right-aligned values (counts, durations, times) use tabular figures.
- Vertical centering: rows center their content. Cards with multi-line text top-align the leading ring (2pt offset) with the first line.
- Visual centers matter more than boxes. The timeline's ring is centered on the first 48pt of the capsule, not on the whole row.
