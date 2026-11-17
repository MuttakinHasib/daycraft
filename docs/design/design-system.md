# Design system

Design system v1.1 for every Daycraft app. This file names the tokens and the rules for using them. **Values live only in [`@daycraft/design-tokens`](../../packages/design-tokens/src)** (ADR-0001), which generates each app's theme CSS and checks contrast in its build. To see every token rendered, open the design-system page: `/design-system` in either app.

Sources of truth, in order: the design canvas page "v2 · Current" decides what values should be; the token package decides what the apps render and changes only to match the canvas; [reference/daycraft-tailwind-v1.1.css](reference/daycraft-tailwind-v1.1.css) is a frozen export.

**Rule: feature code uses token classes only.** No hex, `rgb()` or arbitrary `[…]` values for color, type, radius or spacing. If a token is missing, add it to the token package (and its `cn` configuration follows automatically). The only exceptions:

- Pixel positions computed by layout code (timeline geometry).
- White for icons and text placed on activity hues or a hue-colored header.
- Hue tints computed from a hue (see below).

Platform notes: [mobile](../../apps/mobile/docs/design/design-system.md) (Uniwind, Reanimated) · [web](../../apps/web/docs/design/design-system.md) (Tailwind, CSS).

## Semantic colors

They change with the theme. Use them as `bg-*`, `text-*` and `border-*`.

| Token | Use |
|---|---|
| `canvas` | App background behind everything |
| `surface` | Cards, sheets, panels, the Plan timeline panel, lists |
| `sunken` | Chips, segmented track, fields on surface, tags, kanban columns, nav hover |
| `elevated` | Floating tab bar, selected segment |
| `line` | Hairlines, card borders, hour lines |
| `line-strong` | Dashed spine, unchecked checkbox borders, grabber |
| `ink` | Primary text, selected chip background |
| `ink-muted` | Secondary text, meta, inactive tabs |
| `ink-subtle` | Tertiary text, hour labels, section labels, placeholders |
| `accent` | Primary buttons, the + button, selected date, now line, progress |
| `accent-hover` | Hover or pressed accent surfaces (web) |
| `accent-soft` | “Now” tag, Plan and Place chips, prompt banner, Today chip, active nav item |
| `accent-text` | Accent used as text: the year in the date, back links, gap durations |
| `on-accent` | Text and icons on `accent`. Dark-theme accent is light, so this turns dark: never hardcode white on accent |
| `success` | Positive states, sparingly |
| `danger` | Delete, high priority |
| `scrim` | Backdrop behind sheets and dialogs |

### Contrast (checked in the token build)

- `ink-subtle` on `canvas` and on `surface` ≥ 4.5:1 in both themes.
- `on-accent` on `accent` ≥ 4.5:1 in both themes.
- White icons on every hue ≥ 3:1.
- Never put `ink-subtle` text below 14px on `sunken` in light mode (about 4.1:1).

## Activity hues

Nine hues, the same in both themes: `clay`, `amber`, `sun`, `sage`, `pine`, `sky`, `iris`, `rose`, `slate`. The names are domain data (`ActivityHue` in `@daycraft/domain`); the values are tokens.

- Hues color **user content only**: capsules, hue tiles, habit circles, mood, the spine. Never chrome, buttons or brand.
- Text on a hue is white at ≥ 16px bold or ≥ 18px. Smaller text on a hue sits on a white chip.
- Map hue → class with complete string literals (`bg-${hue}` is never built at runtime; Tailwind scans class names at build time).
- Typical use: clay for deep work (the default task hue), amber for mornings and meals, sun for errands and calls, sage for movement and health, pine for writing and planning, sky for meetings (the default event hue), iris for learning and reflection, rose for people, slate for rest.

### Hue tints

| Tint | Where |
|---|---|
| 14% | Habit circle, not done |
| 16% fill / 40% border | Event agenda card |
| 28% ring | Active capsule outline |
| 30% | Event card tint (agenda, Upcoming) |
| 42% | Active capsule base (the remaining part) |
| 60% border, dashed | Habit circle, not done |

## Type

Plus Jakarta Sans. Each preset is a `type-*` class on both platforms, carrying size, line height, tracking and weight.

| Preset | Use |
|---|---|
| `type-display` | Screen titles |
| `type-date` | Plan date header |
| `type-title` | Secondary page titles (month, project) |
| `type-heading` | Sheet titles, empty states |
| `type-activity` | Activity titles |
| `type-body` | Body text |
| `type-body-sm` | Subtitles, descriptions, notes |
| `type-control` | Chips, segmented controls |
| `type-meta` | Times, durations |
| `type-label` | Uppercase section labels (add `uppercase`) |
| `type-micro` | Timeline gutter, tab labels |
| `type-clock` | Focus timer only |

Weights: 400, 500, 600, 700, 800. Times and durations use tabular figures.

## Radii

`rounded-check` (checkbox squares, heat-map cells) · `rounded-tile` (icon tiles, segmented track) · `rounded-segment` (selected segment) · `rounded-field` (inputs, list groups, agenda cards) · `rounded-card` (cards, kanban columns) · `rounded-capsule` (timeline capsule) · `rounded-panel` (desktop panels) · `rounded-sheet` (bottom sheets, the Plan timeline panel).

**Every pill is `rounded-full`**: buttons, chips, tags, icon buttons, rings, the tab bar. Never compute half a height, and never add an in-between radius.

## Elevation

Flat by default: surfaces separate by color and hairlines. Shadows only on things that float.

- `shadow-float`: tab bar, sheets, dialogs, toast, floating menus.
- `shadow-lift`: a capsule while it is dragged.
- The floating + button alone gets an accent glow.

## Motion

| Name | Spec | Use |
|---|---|---|
| `ease-snap` | the snap curve | Sheets, toasts, anything entering |
| sheet-up | rise 48 + fade, `sheetUp` duration, `ease-snap` | Sheets |
| fade-in | `fadeIn` duration | Screen content, scrims, expanding sections |
| toast-in | rise 12 + fade, `toastIn` duration, `ease-snap` | Toast |
| pop | scale 0.6 → 1.12 → 1, `pop` duration | Check marks appearing, new capsules, focus-complete badge |
| spring-snap | `springs.snap`: Motion's visualDuration 0.35s, bounce 0.1 (no visible overshoot, settles in about 0.47s) | Selections that glide into place: the segmented control's pill |
| press | scale 0.96 (buttons, cards), 0.98 (primary button), 0.88 (check ring), `press` duration | Pressable feedback |
| reflow | `reflow` duration | Timeline rows while another row is dragged |
| progress | `progress` duration | Progress rings and bars |
| theme | `theme` duration | Theme cross-fade where supported |

Respect Reduce Motion: replace movement with instant changes or plain fades.

## Focus

Keyboard focus is always visible: a 2px `accent` outline with a 2px offset on web; the platform focus ring on native. Never remove it without an equal replacement.

## Icons

From `@daycraft/icons` (ADR-0002): Lucide at stroke 1.9, plus the prototype's own SVG for the mood faces `m1`–`m5`, `run` and `timeline`. Data stores Daycraft icon names (`IconName` in `@daycraft/domain`), never library names.

- 24 grid, 1.9 stroke, round caps and joins, outline only. The check inside a ring is 3.2 stroke.
- Sizes: 22 in capsules; 20–21 in the tab bar, editor icon grid and habit circles; 18 in rows, nav items and icon buttons; 15–17 in chips and buttons; 12–13 in tags.
- Groups: `ACTIVITY_ICONS` (the picker for activities, habits and routines), `INTERFACE_ICONS`, `MOOD_ICONS`.
- Icons are decorative: label the control around them. No emoji in UI.

## Brand

- **Logo:** Daybreak, a 28×60 capsule with a sunrise dome and horizon cut out, plus the lowercase “daycraft” wordmark (Plus Jakarta Sans Bold, joined f-t crossbar). Symbol color: `accent` on canvas.
- **App icon:** canvas symbol on a terracotta tile (light); terracotta-dark symbol on the dark surface (dark).
- **Web sidebar:** symbol 15×32 + wordmark 22 tall. **Favicon:** the pixel-fit 16/32 variant.
- Assets: the `daycraft-logo/` package from the design canvas. Not in the repo yet; it will live in `packages/brand`.
