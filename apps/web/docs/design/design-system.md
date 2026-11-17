# Design system: tokens

[reference/daycraft-tailwind-v1.1.css](reference/daycraft-tailwind-v1.1.css) is the token file for this app. Wire it into `src/app/globals.css` first (see [status](../status-and-decisions.md#first-implementation-steps-in-order)). Everything below describes those tokens. `apps/mobile` implements the same names and values with Uniwind.

Rule: **feature code uses token classes only.** None of the following:

- hex, `rgb()` or `bg-[…]`-style arbitrary values;
- Tailwind palette colors (`zinc-*`, `gray-*`, `black`, `white`);
- off-scale spacing.

The only exceptions:

- Absolute positions computed by layout code (the timeline).
- `text-white` for icons and text on **activity hues** and hue-colored panel headers.
- Hue tints with `color-mix()` as listed below.

## Semantic colors

Defined as CSS variables on `:root` (light) and `.dark`, and exposed as utilities by `@theme inline` (`bg-canvas`, `text-ink-muted`, `border-line`, …). Opacity modifiers work (`bg-ink/50`).

| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | `#F7F5F2` | `#121110` | Page background |
| `surface` | `#FFFFFF` | `#1B1A18` | Sidebar, panels, cards, dialogs |
| `sunken` | `#EFECE7` | `#262422` | Chips, segmented track, fields on surface, nav hover, tags |
| `elevated` | `#FFFFFF` | `#312E2B` | Selected segment, floating elements |
| `line` | `#E6E1DA` | `#2F2D2A` | Hairlines, panel borders, hour lines |
| `line-strong` | `#D5CEC4` | `#45413C` | Dashed spine, unchecked boxes, dashed habit chips |
| `ink` | `#1B1916` | `#F2EFEA` | Primary text; pressed chip background |
| `ink-muted` | `#5F5953` | `#B3ADA5` | Secondary text, meta, inactive nav |
| `ink-subtle` | `#716B64` | `#9A948C` | Tertiary text, hour labels, section labels, placeholders |
| `accent` | `#AD5236` | `#E4815D` | Primary buttons, New task, selected date, now line, progress |
| `accent-hover` | `#97462D` | `#EC9475` | `hover:` on accent surfaces |
| `accent-soft` | `#F6E4DB` | `#3A251C` | Active nav item, “Now” tag, Plan chips, focus timer box |
| `accent-text` | `#AD5236` | `#EE936F` | Accent as text: year, active nav label, gap durations, now label |
| `on-accent` | `#FFFFFF` | `#241109` | Text and icons on `accent` |
| `success` | `#3C7D61` | `#5FB08A` | Positive states (sparingly) |
| `danger` | `#B4473F` | `#E0796F` | Delete, high priority |
| `scrim` | `rgb(27 25 22 / .34)` | `rgb(0 0 0 / .58)` | Dialog backdrop |

Contrast is checked:

- `ink-subtle` ≥ 4.5:1 on canvas and surface;
- white on light accent 4.8:1;
- dark `on-accent` on dark accent 6.5:1.

New text/background pairs need a contrast check.

## Activity hues

Constant across themes (`@theme`): `bg-clay`, `border-sky`, `text-pine`, …

| Hue | Hex | White icon contrast | Typical use |
|---|---|---|---|
| clay | `#C8694A` | 3.8:1 | Deep work, default task |
| amber | `#C47A34` | 3.4:1 | Mornings, meals |
| sun | `#B08A2A` | 3.2:1 | Errands, calls |
| sage | `#5E9154` | 3.7:1 | Movement, health |
| pine | `#3C7D61` | 4.9:1 | Writing, planning |
| sky | `#4F86C0` | 3.8:1 | Meetings, events (default event hue) |
| iris | `#7569C4` | 4.6:1 | Learning, reflection |
| rose | `#C25E78` | 4.1:1 | People, social |
| slate | `#66707F` | 5.0:1 | Rest, wind-down |

Rules:

- Hues color user content only. Never use them for chrome or brand.
- Text on a hue is white at ≥ 16px bold or ≥ 18px.
- **Never build class names dynamically** (``bg-${hue}``): Tailwind scans source files at build time. Use a literal map (`const HUE_BG: Record<Hue, string> = { clay: 'bg-clay', … }`).
- When a hue is data-driven inside a computed style, use the CSS variable: `style={{ background: 'var(--color-clay)' }}`, or `color-mix(in srgb, var(--color-clay) 42%, var(--color-surface))`.

### Hue tints (`color-mix`, as in the prototype)

| Mix | Where |
|---|---|
| 14–18% into surface | Habit circle/chip icon (not done) |
| 16% into surface | Done habit chip background, event agenda card |
| 28% into transparent | Active capsule outer ring (4px `box-shadow`) |
| 30% into surface | Event block in Week view |
| 42% into surface | Active capsule base (remaining part) |
| 60% `sunken` into transparent | Selected timeline row background (keeps the now line visible) |

## Radii

| Utility | Value | Use |
|---|---|---|
| `rounded-check` | 6 | Checkbox squares, heat-map cells, week-view blocks |
| `rounded-tile` | 12 | Icon tiles, nav items (12), segmented track (`rounded-xl`) |
| `rounded-field` | 16 | Fields on `sunken`, notes box, kanban cards, the selected-row tint |
| `rounded-card` | 20 | Cards, list groups, week-strip day buttons |
| `rounded-capsule` | 24 | Timeline capsule |
| `rounded-panel` | 24 | Desktop panels (timeline panel, aside cards), week-strip container, dialogs |
| `rounded-sheet` | 30 | Phone sheets (not used on desktop) |
| `rounded-full` | — | Every pill: buttons, chips, tags, icon buttons, rings, avatars, fields shaped as pills |

No in-between radii, and never half-height pixel radii for pills.

## Elevation

Flat by default.

| Utility | Use |
|---|---|
| `shadow-float` | Dialogs, toast, floating menus |
| `shadow-lift` | A capsule while dragged |

Panels and cards use a `line` border, not shadows.

## Motion

Tokens in `@theme`:

- `--ease-snap: cubic-bezier(.2,.9,.25,1)`.
- `animate-sheet-up` (48px rise, .34s).
- `animate-fade-in` (.22s).
- `animate-pop` (scale .6 → 1.12 → 1, .7s).

Also used in the prototype:

| Effect | Spec |
|---|---|
| Toast in | translateY 12 → 0 + fade, .28s `ease-snap` |
| Press | `active:scale-[.96]`. Exception to the arbitrary-value rule; prefer a `press` utility once one exists. Primary button .98, check ring .88 |
| Timeline reflow | `transition: top .22s ease` on rows (off for the dragged row) |
| Progress | `stroke-dasharray` / width .5s ease |
| Theme switch | `background-color, color .3s` on the root |
| Hover | color/background .15–.2s |

Wrap movement in `motion-safe:`, or disable it under `prefers-reduced-motion` (see [accessibility](accessibility.md)).

## Focus

`:focus-visible` → 2px solid `accent` outline, offset 2px (set in the base layer). Never remove outlines without an equal replacement.

## Icons

- 24 grid, 1.9 stroke, round caps and joins, `currentColor`, outline only. The check inside rings is 3.2 stroke.
- **Sizes:**
  - 22 in capsules;
  - 18 for nav items, panel rows and icon buttons;
  - 15–17 in buttons and chips;
  - 12–13 in tags.
- The library is open decision W4. Icon names are listed in `apps/mobile/docs/design/design-system.md` and on the Design system board.
- No emoji in UI.

## Brand

- **Logo:** Daybreak symbol (a capsule with a sunrise cut out, 28×60) + the “daycraft” wordmark (lowercase, joined f-t).
- **Sidebar:** symbol 15×32 + wordmark 22 tall.
- **Favicon:** the pixel-fit 16/32 tile variant.
- **Assets:** `daycraft-logo/` package (SVG/PNG/ICO) from the design canvas. Not in this repo yet.
