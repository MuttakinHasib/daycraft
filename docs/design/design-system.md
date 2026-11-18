# Design system

Design system v2 (“Clean”) for every Daycraft app: a white canvas, light-gray cards, saturated activity colors with white icons on them, a blue accent and Onest at regular to semibold weights. It replaced v1.1 (cream, terracotta, Plus Jakarta Sans extra-bold) on 2026-11-17; see [ADR-0008](../adr/0008-visual-direction-clean.md). This file names the tokens and the rules for using them. **Values live only in [`@daycraft/design-tokens`](../../packages/design-tokens/src)** (ADR-0001), which generates each app's theme CSS and checks contrast in its build. To see every token rendered, open the design-system page: `/design-system` in either app.

Sources of truth, in order: the design canvas page "v3 · Clean (new direction)" decides what values should be (layout and behavior still come from "v2 · Current"); the token package decides what the apps render and changes only to match the canvas; [reference/daycraft-tailwind-v1.1.css](reference/daycraft-tailwind-v1.1.css) is a frozen export of the old v1.1 look (history only).

**Rule: feature code uses token classes only.** No hex, `rgb()` or arbitrary `[…]` values for color, type, radius or spacing. If a token is missing, add it to the token package (and its `cn` configuration follows automatically). The only exceptions:

- Pixel positions computed by layout code (timeline geometry).
- Hue tints computed from a hue (see below).

Platform notes: [mobile](../../apps/mobile/docs/design/design-system.md) (Uniwind, Reanimated) · [web](../../apps/web/docs/design/design-system.md) (Tailwind, CSS).

## Semantic colors

They change with the theme. Use them as `bg-*`, `text-*` and `border-*`.

| Token | Use |
|---|---|
| `canvas` | App background behind everything (white in light) |
| `surface` | Sheets, panels, the Plan timeline panel |
| `card` | Cards, list groups, habit and goal cards, info blocks. A light-gray fill, no border |
| `sunken` | Chips, segmented track, fields on surface, tags, kanban columns, nav hover |
| `elevated` | Floating tab bar (dark veil), menus |
| `raised` | The selected thumb on a `sunken` track (segmented controls). White in light, #424242 in dark so it stands clearly above the #292929 track; `ink` on it passes 4.5:1 |
| `line` | Hairlines, hour lines, row separators (cards have no border) |
| `line-strong` | Dashed spine, unchecked checkbox borders, grabber |
| `ink` | Primary text, selected chip background |
| `ink-muted` | Secondary text, meta, inactive tabs |
| `ink-subtle` | Tertiary text, hour labels, section labels, placeholders |
| `accent` | Primary buttons, the active tab pill, selected date, now line, progress |
| `accent-hover` | Hover or pressed accent surfaces (web) |
| `accent-soft` | “Now” tag, Plan and Place chips, prompt banner, Today chip, active nav item |
| `accent-text` | Accent used as text: the year in the date, back links, gap durations |
| `on-accent` | Text and icons on `accent`: white in both themes (the dark-theme accent is deep enough to keep 4.5:1). Still use the token, never hardcode white |
| `on-hue` | Icons and text on an activity hue: white in both themes (every hue is deep enough for 3:1) |
| `success` | Positive states, sparingly |
| `danger` | Delete, high priority |
| `scrim` | Backdrop behind sheets and dialogs |

### Contrast (checked in the token build)

- `ink-subtle` on `canvas`, `surface` and `card` ≥ 4.5:1 in both themes.
- `on-accent` on `accent` ≥ 4.5:1 in both themes.
- `on-hue` (white) icons on every hue ≥ 3:1 in both themes (the hues are tuned to about 3.2:1 or better).
- Hues are not text colors (about 3.2:1 on white is below the 4.5:1 text bar). Never use a hue as a text color; use it as a fill, a ring, a tag or a marker behind text.

## Activity hues

Nine hues, the same in both themes: `clay`, `amber`, `sun`, `sage`, `pine`, `sky`, `iris`, `rose`, `slate`. The names are domain data (`ActivityHue` in `@daycraft/domain`); the values are tokens.

- Hues color **user content only**: capsules, hue tiles, habit circles, mood, the spine. Never chrome, buttons or brand.
- Icons and text on a hue use `text-on-hue` (white). Hue tags (WORK, HOME) are `on-hue` text on the solid hue.
- To highlight a word in a headline, put a 42% hue marker behind it (`rounded-tile`, padding 0 6); never color the text.
- Map hue → class with complete string literals (`bg-${hue}` is never built at runtime; Tailwind scans class names at build time).
- Typical use: clay for deep work (the default task hue), amber for mornings and meals, sun for errands and calls, sage for movement and health, pine for writing and planning, sky for meetings (the default event hue), iris for learning and reflection, rose for people, slate for rest.

### Hue tints

Shares live in `hueTints` and `sheetHeaderTint` (`@daycraft/design-tokens`); code reads them from there, never as literals.

| Tint | Where |
|---|---|
| 14% | Habit circle, not done |
| 16% fill / 40% border | Event agenda card |
| 28% ring | Active capsule outline |
| 30% | Event card tint (agenda, Upcoming) |
| 42% over `surface` | Active capsule base (the part still ahead); the elapsed part is the solid hue |
| Light: 40% over `canvas`, `ink` text. Dark: the solid hue, `on-hue` text | Detail and editor sheet header band (`sheetHeaderTint`) |
| 42% | Headline highlight marker |
| 60% border, dashed | Habit circle, not done |
| `on-hue` at 75% | The 16×3 bar in a capsule's resize grip (`CAPSULE_GRIP_OPACITY`) |

## Type

**Onest** (Google Fonts, OFL). Weight comes from size, not from heavy type: titles are semibold, nothing in the UI is bolder than 600. Each preset is a `type-*` class on both platforms, carrying size, line height, tracking and weight.

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

Weights in use: 400, 500, 600 (700 and 800 stay embedded for edge cases but no preset uses them). Times and durations use tabular figures.

## Radii

`rounded-check` (checkbox squares, heat-map cells) · `rounded-tile` (icon tiles, segmented track) · `rounded-segment` (selected segment) · `rounded-field` (inputs, list groups, agenda cards) · `rounded-card` (cards, kanban columns) · `rounded-capsule` (timeline capsule) · `rounded-panel` (desktop panels) · `rounded-sheet` (bottom sheets, the Plan timeline panel).

**Every pill is `rounded-full`**: buttons, chips, tags, icon buttons, rings, the tab bar. Never compute half a height, and never add an in-between radius.

## Elevation

Flat by default: surfaces separate by fill (white `surface`, gray `card`), not borders. Shadows only on things that float.

- `shadow-float`: sheets, dialogs, toast, floating menus.
- **Glass** (`glass` token): the phone tab bar floats as frosted glass, mostly opaque so bright blocks can't smear through: `surface` at 88% (light) or `elevated` at 82% (dark) over a blur (CSS `blur(20px) saturate(160%)`), a 1px hairline rim (ink 7% light, white 9% dark), a brighter 1px top highlight and a two-layer soft shadow. A `canvas` fade (128 tall, solid for its lower 30%) sits behind the bar so content dissolves before reaching it. On iOS 26 the system's Liquid Glass replaces the pill. Nothing else uses glass.
- `shadow-lift`: a capsule while it is dragged.
- `shadow-thumb`: the selected thumb on a `sunken` track (segmented controls). A soft drop in light; in dark a 6% white top highlight and a deeper drop. Mobile applies `shadows.thumb[scheme]` as a style.
- The tab bar has one colored element: the + is a 56 `accent` circle with a white icon, an inset top highlight and a soft accent glow (`glass.plus`), floating beside the pill. The active tab is quiet: a translucent ink pill (`glass.selection`, ink 7% light, white 11% dark) with an `ink` icon and label; inactive tabs are `ink-subtle`. See [ADR-0009](../adr/0009-tab-bar-plus-beside-the-pill.md).

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

- **Logo:** Sunrise Pen (canvas board “12 · Final mark — Sunrise Pen”): a half sun with five short rays, a horizon line, and a fountain pen whose nib draws the horizon. Two tones: the sun and rays are the soft layer, the pen and horizon are solid. The wordmark is lowercase “daycraft”.
- **Colors in the app:** sun and rays `clay` at 55%, pen and horizon `ink`. Below 40px use the small-size drawing (thicker rays and horizon, solid nib).
- **App icon:** the appearances on the logo board (light, dark, tinted, cream).
- **Splash:** the pen slides in and draws the horizon, the sun rises behind it, the rays pop out left to right, then the wordmark fades up; 2.6s, then a fade into onboarding (spec on the canvas page “Splash & onboarding”).
- **Web sidebar:** mark 38×32 + wordmark 24 tall. **Favicon:** the small-size drawing.
- Assets: export from the logo board into `packages/brand` (not in the repo yet).
