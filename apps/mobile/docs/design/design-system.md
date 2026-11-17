# Design system: tokens

`src/global.css` is the implementation. Design system v1.1 ([reference CSS](reference/daycraft-tailwind-v1.1.css)) is the target. Values below are the **v1.1 target**. Where `global.css` still differs, the gap is listed in [status-and-decisions](../status-and-decisions.md#token-gaps-globalcss-v10-vs-design-system-v11).

Rule: **feature code uses token classes only.** No hex, `rgb()`, or arbitrary `[…]` values for color, type, radius or spacing. The only exceptions:

- Absolute pixel positions computed by layout code (timeline geometry).
- White (`text-white` / `#FFFFFF`) for icons and text placed **on activity hues** or on a hue-colored sheet header.
- Opacity-derived tints of hues (see Hue tints below).

## Semantic colors

Defined per theme in `@layer theme { :root { @variant light/dark } }`. Use them via the Tailwind color utilities `bg-*`, `text-*`, `border-*`.

| Token | Class examples | Light | Dark | Use |
|---|---|---|---|---|
| canvas | `bg-canvas` | `#F7F5F2` | `#121110` | App background behind everything |
| surface | `bg-surface` | `#FFFFFF` | `#1B1A18` | Cards, sheets, timeline panel, lists |
| sunken | `bg-sunken` | `#EFECE7` | `#262422` | Chips, segmented track, inputs on surface, tags, kanban columns |
| elevated | `bg-elevated` | `#FFFFFF` | `#312E2B` (code: `#2C2A27`) | Floating tab bar, selected segment |
| line | `border-line` | `#E6E1DA` | `#2F2D2A` | Hairlines, card borders, hour lines |
| line-strong | `border-line-strong` | `#D5CEC4` | `#45413C` | Dashed spine, unchecked checkbox borders, grabber |
| ink | `text-ink` | `#1B1916` | `#F2EFEA` | Primary text, pressed chip background |
| ink-muted | `text-ink-muted` | `#5F5953` | `#B3ADA5` | Secondary text, meta, inactive tabs |
| ink-subtle | `text-ink-subtle` | `#716B64` | `#9A948C` | Tertiary text, hour labels, section labels, placeholders |
| accent | `bg-accent` | `#AD5236` | `#E4815D` | Primary buttons, + button, selected date, now line, progress |
| accent-hover | `bg-accent-hover` | `#97462D` | `#EC9475` | Hover/pressed for accent surfaces (web/desktop) |
| accent-soft | `bg-accent-soft` | `#F6E4DB` | `#3A251C` | “Now” tag, Plan/Place chips, prompt banner, Today chip |
| accent-text | `text-accent-text` | `#AD5236` | `#EE936F` | Accent used as text: year in the date, back links, gap durations |
| on-accent | `text-on-accent` | `#FFFFFF` | `#241109` | Text and icons on `accent` (dark-mode accent is light, so text turns dark) |
| success | `text-success` | `#3C7D61` | `#5FB08A` | Positive states (sparingly) |
| danger | `text-danger` | `#B4473F` | `#E0796F` | Delete, high priority |
| scrim | `bg-scrim` | `rgba(27,25,22,.34)` | `rgba(0,0,0,.58)` | Sheet backdrop |

Contrast (checked):

- `ink-subtle` ≥ 4.5:1 on canvas and surface in both themes.
- White on light `accent` ≥ 4.8:1; dark `on-accent` on dark `accent` 6.5:1.
- Never put `ink-subtle` text on `sunken` at sizes below 14px in light mode (4.1:1).

## Activity hues

Nine constant hues: the same in both themes, defined in `@theme`, used via `bg-clay`, `border-sky`, etc. The TypeScript source is `ActivityHue` in `src/components/ui/hues.ts`.

| Hue | Hex | White-icon contrast | Typical use |
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

- Hues color **user content only**: capsules, hue tiles, habit circles, mood, the spine. Never use them for chrome, buttons or brand.
- Text on a hue is white at ≥ 16px bold or ≥ 18px. Small text on hues needs a white chip behind it.
- Tailwind scans class names at build time. **Map hue → class with complete string literals** (`ActivityHueBackground` in `hues.ts`). Never build ``bg-${hue}``. Add a `Border`/`Text` map next to it when needed.

### Hue tints

The prototype mixes hues into the surface for tinted states. In the docs and the reference CSS these are written as `color-mix(in srgb, hue N%, surface)`. On native, use opacity utilities on the hue (`bg-sky/30`), or the `withAlpha` approach in `capsule.tsx` when a computed color is unavoidable.

| Tint | Where |
|---|---|
| 14% (habit circle, not done) | Habit row |
| 16% / 40% border | Event agenda card |
| 28% ring | Active capsule outline |
| 30% | Event card tint (agenda, Upcoming) |
| 42% | Active capsule base (the remaining part) |
| 60% border, dashed | Habit circle, not done |

## Radii

| Token | Value | Use |
|---|---|---|
| `rounded-check` *(v1.1)* | 6 | Checkbox squares, heat-map cells, week-view blocks |
| `rounded-tile` *(v1.1)* | 12 | Icon tiles (32–40pt), segmented track (code: 13) |
| `rounded-field` | 16 | Inputs on `sunken`, agenda cards, prompt banner, kanban cards, toast-adjacent boxes |
| `rounded-card` | 20 | Cards, list groups, kanban columns |
| `rounded-capsule` | 24 | Timeline capsule, routine icon capsule |
| `rounded-panel` *(v1.1)* | 24 | Desktop panels |
| `rounded-sheet` | 30 | Bottom sheets, Today timeline panel (top corners) |
| `rounded-full` | 9999 | **Every pill:** buttons, chips, tags, icon buttons, rings, tab bar, avatars |

Do not create in-between radii. If something is a pill, it is `rounded-full`; never compute half its height.

## Elevation

Flat by default: surfaces are separated by color and hairlines. Shadows only on things that float.

| Utility | Value | Use |
|---|---|---|
| `shadow-float` | `0 1px 2px` + `0 12px 32px` of `rgba(27,25,22,.10)` (light) / `rgba(0,0,0,.5)` (dark), via `light-dark()` | Tab bar, sheets, toast |
| `shadow-lift` | `0 12px 28px rgba(0,0,0,.28)` | A capsule while it is dragged |
| Accent glow | `0 10px 26px` accent at 45% | The floating + button only |

## Motion

CSS animations and transitions are Uniwind Pro features. In this repo **all motion is Reanimated** (see `src/components/ui/sheet.tsx`). Use these values:

| Name | Spec | Use |
|---|---|---|
| `ease-snap` | `Easing.bezier(0.2, 0.9, 0.25, 1)` | Sheets, toasts, anything entering |
| sheet-up | translateY 48 → 0 over 340ms `ease-snap`; opacity 0 → 1 over 220ms | Sheets |
| fade-in | opacity over 220ms ease | Screen content, scrims, expanded sections |
| toast-in | translateY 12 → 0 + fade, 280ms `ease-snap` | Toast |
| pop | scale 0.6 → 1.12 → 1 over 700ms | Check marks appearing, newly created capsules, focus-complete badge |
| press | scale 0.96 (buttons and cards), 0.88 (check ring), 0.98 (primary button), ~140ms | Pressable feedback (`active:` or Reanimated) |
| reflow | `top`/`height` 220ms ease | Timeline rows while another row is dragged |
| progress | 500ms ease | Progress rings and bars |
| theme | colors cross-fade ~300ms (where supported) | Theme switch |

Respect **Reduce Motion** (`useReducedMotion` from Reanimated): replace movement with instant changes or plain fades. See [accessibility](accessibility.md).

## Focus states

- Web/desktop: a 2px `accent` outline with a 2px offset on `:focus-visible` for buttons, inputs and textareas.
- Native: rely on the platform focus ring (iPad keyboard, Android); never remove it.

## Icons

- **Style:** 24pt grid, 1.9 stroke, round caps and joins, outline only, `currentColor`. The check mark inside rings is 3.2 stroke.
- **Sizes:**
  - 22 in capsules;
  - 20–21 in the tab bar, editor icon grid and habit circles;
  - 18 in list rows and icon buttons;
  - 15–17 in chips and buttons;
  - 12–13 in tags.
- **Activity icon set** (names used in data): check, alarm, sun, moon, run, dumbbell, coffee, utensils, book, cap, laptop, video, doc, phone, pen, heart, leaf, drop, wind, cart, home, music, briefcase, spark.
- **UI icons:**
  - Navigation and arrows: chevrons, plus/minus, x, check, checksq, inbox, timeline, calendar, grid, upcoming, routine, arrow-r.
  - Actions and metadata: repeat, clock, flag, tag, list, kanban, play, pause, stop, trash, edit, flame, pin, target, folder, journal, timer, shuffle.
  - Moods: m1–m5.
- Which library supplies them is open decision D4. Whatever it is, the visual rules above stay fixed. No emoji in UI.

## Brand

- **Logo:** “Daybreak”, a 28×60 capsule with a sunrise dome and horizon cut out, plus the wordmark “daycraft” (lowercase Plus Jakarta Sans Bold, joined f-t crossbar).
- Symbol color: `accent` on canvas.
- **App icon:** Canvas symbol on a Terracotta tile (light), Terracotta-dark symbol on `#1B1A18` (dark).
- Below 24pt use the pixel-fit favicon variant.
- Assets: logo package `daycraft-logo/` (SVG + PNG + favicon), delivered with the design canvas. Not yet in this repo. See [status](../status-and-decisions.md#implementation-status).
