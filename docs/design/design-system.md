# Design system

Design system v2 ("Clean") for every Daycraft app: a white canvas, light-gray cards, saturated activity colors with white icons on them, a blue accent and Onest at regular to semibold weights. It replaced v1.1 (cream, terracotta, Plus Jakarta Sans extra-bold) on 2026-11-17; see [ADR-0008](../adr/0008-visual-direction-clean.md). This file names the tokens and the rules for using them. **Values live only in [`@daycraft/design-tokens`](../../packages/design-tokens/src)** (ADR-0001), which generates each app's theme CSS and checks contrast in its build. To see every token rendered, open the design-system page: `/design-system` in either app.

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
| `raised` | The selected thumb on a `sunken` track (segmented controls). White in light. In dark it is #424242, so the thumb is distinct from the #292929 track; `ink` on it passes 4.5:1 |
| `line` | Hairlines, hour lines, row separators (cards have no border) |
| `line-strong` | Dashed spine, unchecked checkbox borders, grabber |
| `ink` | Primary text, selected chip background |
| `ink-muted` | Secondary text, meta |
| `ink-subtle` | Tertiary text, hour labels, section labels, placeholders, inactive tabs |
| `accent` | Primary buttons, the + button, selected date, now line, progress |
| `accent-hover` | Hover or pressed accent surfaces (web) |
| `accent-soft` | "Now" tag, Plan and Place chips, prompt banner, Today chip, active nav item |
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
- To highlight a word in a headline, put a 42% hue marker behind it (`rounded-tile`, padding 0 6); never color the text. On native the marker is a View behind the word, reaching 3pt above the line box so the space over the capitals matches the sides, with any punctuation after it kept on its line.
- Map each hue to its class with complete string literals (`bg-${hue}` is never built at runtime; Tailwind scans class names at build time).
- Typical use: clay for deep work (the default task hue), amber for mornings and meals, sun for errands and calls, sage for movement and health, pine for writing and planning, sky for meetings (the default event hue), iris for learning and reflection, rose for people, slate for rest.

### Hue tints

Shares live in `hueTints` and `sheetHeaderTint` (`@daycraft/design-tokens`); code reads them from there, never as literals.

| Tint | Where |
|---|---|
| 14% | Habit circle, not done |
| 16% fill / 40% border | Event agenda card |
| 26% | The agenda card's "Event" tag (text `ink`) |
| 16% fill (done) / 18% icon circle (not done) | Desktop habit chip |
| 28% ring | Active capsule outline |
| 30% | Event card tint (agenda, Upcoming); week-grid event blocks add a solid hue border |
| 70% border | Week-grid task block (fill `surface`) |
| 24% | Completed project milestone tag (text `ink`) |
| 42% over `surface` | Active capsule base (the part still ahead); the elapsed part is the solid hue |
| Light: 40% over `canvas`, `ink` text. Dark: the solid hue, `on-hue` text | Activity sheet header band (`sheetHeaderTint`) |
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
| `type-wordmark` | The "daycraft" wordmark under the mark (splash) |

Weights in use: 400, 500, 600 (700 and 800 stay embedded for edge cases but no preset uses them). Times and durations use tabular figures.

## Radii

`rounded-check` (checkbox squares, heat-map cells) · `rounded-tile` (icon tiles, segmented track) · `rounded-segment` (selected segment) · `rounded-field` (inputs, list groups, agenda cards) · `rounded-card` (cards, kanban columns) · `rounded-capsule` (timeline capsule) · `rounded-panel` (desktop panels) · `rounded-sheet` (bottom sheets, the Plan timeline panel).

**Every pill is `rounded-full`**: buttons, chips, tags, icon buttons, rings, the tab bar. Never compute half a height, and never add an in-between radius.

## Elevation

Surfaces are flat and separate by fill (white `surface`, gray `card`), not by borders. Only things that float get a shadow.

- `shadow-float`: sheets, dialogs, toast, floating menus.
- **Glass** (`glass` token) is for the phone tab bar only. Its veil is `surface` at 88% (light) or `elevated` at 82% (dark) over a blur (CSS `blur(20px) saturate(160%)`), opaque enough that bright blocks don't show through. It has a 1px hairline rim (ink 7% light, white 9% dark), a brighter 1px top highlight and a two-layer soft shadow. A `canvas` fade sits behind the bar, 128 tall and solid for its lower 30%, so content fades out before it reaches the bar. On iOS 26 the system's Liquid Glass replaces the pill.
- `shadow-lift`: a capsule while it is dragged.
- `shadow-thumb`: the selected thumb on a `sunken` track (segmented controls). A soft drop in light; in dark a 6% white top highlight and a deeper drop. Mobile applies `shadows.thumb[scheme]` as a style.
- The tab bar has one colored element: the + is a 56 `accent` circle with a white icon, an inset top highlight and a soft accent glow (`glass.plus`), floating beside the pill. The active tab is a translucent ink pill (`glass.selection`, ink 7% light, white 11% dark) with an `ink` icon and label. Inactive tabs are `ink-subtle`. See [ADR-0009](../adr/0009-tab-bar-plus-beside-the-pill.md).

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

- **Logo:** Blocks and pen, sun with rays (canvas board "17 · Blocks, sun and pen", version S2). On the left, a planned day as three blocks: a sun with three short rays, a task chip and a rounded block. On the right, the timeline capsule as a fountain pen with a nib, its slit and breather hole cut out. The wordmark is lowercase "daycraft" in Onest 600, `ink` (`#F4F4F2` on dark).
- **Colours:** flat, no gradients. Sun `#FFC233`, chip `sage` `#39A25B`, block `#4A7FF8`, pen `clay` `#FF541A`. The icon sits on white. One-colour versions (iOS tinted, Android themed, print) draw every part in one colour and keep the nib cut-outs.
- **Small sizes:** at 32px and below, use the small drawing: no rays, a larger sun, a solid nib.
- **Splash:** the native launch screen is only the background, `#FFFFFF` (`#111111` in dark); `splash-icon.png` is a transparent placeholder. On top of it, `AnimatedSplash` (`apps/mobile/src/features/splash`) builds the mark once the database is ready, over 2.6 s: the blue block drops in with a bounce, then the green chip (0–520 ms); the pen slides up (310–880 ms); the sun rises (570–990 ms); the rays pop out from their inner ends, 70 ms apart (960–1360 ms); the wordmark fades up (1250–1610 ms); then everything fades and scales to 104% into the app (2240–2600 ms). Reduce Motion: the full lockup holds 400 ms, then fades. Storyboard and live loop: canvas board "18 · Splash animation".

### App icons

Source of truth: the generator in the canvas work (1024 SVG per asset), exported as PNG.

| File | Size | Rules |
|---|---|---|
| `apps/mobile/assets/images/icon.png` | 1024×1024 | Top-level `icon`. Full bleed, no transparency, no rounded corners (the OS masks it) |
| `ios-light.png` / `ios-dark.png` / `ios-tinted.png` | 1024×1024 | `ios.icon.{light,dark,tinted}`. Light is the mark on opaque white; dark is the mark on transparent (iOS draws the dark backdrop) (iOS draws the dark backdrop); tinted is the mark in white on transparent |
| `android-icon-foreground.png` | 1024×1024 (108dp) | Transparent; the mark stays inside the 66dp safe circle (46% of the height) |
| `android-icon-background.png` | 1024×1024 | Flat white, same size as the foreground; `backgroundColor` `#FFFFFF` matches it |
| `android-icon-monochrome.png` | 1024×1024 | The mark in white on transparent, same placement as the foreground (themed icons) |
| `splash-icon.png`, `splash-icon-dark.png` | 1024×1024 | Fully transparent: the native launch screen shows only the background (`#FFFFFF`, dark `#111111`) and `AnimatedSplash` draws the mark |
| `favicon.png` | 48×48 | Expo web favicon |
| `apps/web/src/app/icon.svg` | vector | Next.js favicon for modern browsers |
| `apps/web/src/app/favicon.ico` | 16, 32, 48 | Fallback; the 16 and 32px layers use the small drawing |
| `apps/web/src/app/apple-icon.png` | 180×180 | Full bleed, opaque (iOS rounds it) |
| `apps/web/public/icons/icon-192.png`, `icon-512.png` | 192, 512 | PWA icons in `app/manifest.ts` |
| `apps/web/public/icons/icon-maskable-512.png` | 512 | `purpose: maskable`; the mark stays inside the 80% safe circle |

Icon changes only show in a new native build (prebuild); Expo Go and an old dev build keep the previous icon and splash.
