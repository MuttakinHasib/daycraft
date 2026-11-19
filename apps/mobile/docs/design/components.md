# Components

Primitives live in `src/components/ui/` and are exported from `src/components/ui/index.ts`. **Always look here first.** If a primitive almost fits, extend it with a prop. Never copy it into a feature folder.

Conventions for primitives:

- Named exports and a typed props interface (`interface ButtonProps`); variants and sizes are const objects plus union types (`ButtonVariant`, `ChipSize`).
- Each primitive owns all of its classes (there is no CSS component layer); conditional classes go through `cn` in object notation.
- Accessibility role, state and label on every pressable.

## Existing primitives

Specified once for both apps in the root [components](../../../../docs/design/components.md): `Button`, `Chip`, `Tag`, `Segmented`, `CheckRing`, `Capsule`, `SectionLabel`, `Sheet` and `Icon`, plus the hue class maps in `hues.ts`. Mobile-only gaps still open:

- `Capsule`: the active **elapsed fill** (42% base + solid elapsed part) is not implemented; drag and resize belong to the timeline feature, not this primitive.
- `Chip` and `Tag`: a `tone` (accent, accent-soft, hue-tinted) for the Plan, Event, Now and Due variants.
- `CheckRing`: the pop animation on completion.
- `Sheet`: no scrim, close or drag-to-dismiss yet; prefer Expo Router modal presentation for routed sheets and keep this for inline sheets.

## Components to build (specs from the prototype)

Build these as primitives in `src/components/ui/` when the first screen needs them, not before.

### IconButton and TextButton (native)

Small controls are the platform's own buttons, so they look and press like the system's (added 2026-11-19):

- **IconButton** (×, ⋯, ‹ ›, + / −): iOS draws a SwiftUI glass button (`buttonStyle('glass')`, circle, `ink` tint; `bordered` before iOS 26) with the matching SF Symbol; Android draws Material 3's `FilledTonalIconButton` (`sunken` container, `ink` content) holding the app's own icon. 32pt (`sm`) or 44pt (`lg`). An icon without an SF Symbol mapping falls back to the drawn button (`DrawnIconButton`), which web always uses.
- **TextButton** (Today): iOS glass capsule in Onest semibold 15; Android `FilledTonalButton`; web the small `Chip`.
- **ButtonGroup** (Today ×, ‹ › ×): on iOS 26 the buttons are one connected piece of Liquid Glass (`GlassEffectContainer`, 2pt apart), as in the system's own sheet headers. The glass only draws; same-size React Native tap targets sit on top, because native taps inside a form sheet can fall through to the content below. Android and older iOS show the separate native buttons.
- The activity sheet's ⋯ is a native menu: a 44pt glass circle opening the iOS menu, or the Android dropdown.
- `accessibilityLabel` is **required** for IconButton (TypeScript-enforced).

### TextField

- 48pt.
- Variants:
  - `sunken`: `bg-sunken`, `rounded-field`, px 16, for the editor's location field and step names;
  - `pill`: `bg-surface`, border `line`, `rounded-full`, with a trailing 36pt accent add button, for capture fields;
  - `underline`: transparent, 1.5pt bottom border, for title inputs in sheets.
- Placeholder color `ink-subtle` (`placeholderTextColorClassName`).
- Multiline variant: min height 88, 16 padding, `type-body`, line height 1.5.

### Card and ListGroup / ListRow

- **Card:** `bg-card rounded-card p-4`, no border.
- **ListGroup:** a `bg-card` card with no padding and `line` hairlines between its **ListRow**s (min 52, px 16, gap 12; leading 32pt hue tile or 18pt subtle icon; trailing value in `text-ink-muted` tabular; optional chevron).

### TabBar (pill + separate +)

- Built as a custom Expo Router `tabBar` ([ADR-0003](../../../../docs/adr/0003-custom-floating-pill-tab-bar.md), [ADR-0009](../../../../docs/adr/0009-tab-bar-plus-beside-the-pill.md)). On iOS 26+ the pill's background is Liquid Glass (`expo-glass-effect`, `colorScheme` from the app theme); elsewhere it is the frosted pill below.
- **Row:** 16 from each side and 24 above the bottom inset: the pill (`flex-1`), a 16 gap, then the + circle.
- **Pill:** h 60, p 5, frosted per the `glass` token: `expo-blur` (`systemUltraThinMaterial`) under `surface` 88% (light) or `elevated` 82% (dark), 1px hairline rim, brighter top highlight, two-layer shadow.
- **Fade:** a `canvas` gradient behind the bar, 128 plus the bottom inset, solid for its lower 30%, so content dissolves before it reaches the glass.
- **Tabs:** Plan · Habits · Goals · More, `flex-1`, 50 tall, 22pt icon over an 11pt semibold label, gap 3.
  - Icons: Plan `timeline`, Habits `flame`, Goals `target`, More `grid`.
  - Active: a quiet pill (`glass.selection`) that glides between tabs with `springs.snap`, and `text-ink` (`accessibilityState={{ selected: true }}`). Inactive: `text-ink-subtle`.
  - More carries the Inbox badge: 16pt `clay` pill, 10pt count in `on-hue`, 2pt `surface` ring, at the icon's top right. Its label reads "More, 4 in Inbox".
- **+:** a 56 circle, `bg-accent`, white 26pt plus (stroke 2.4), inset top highlight and a soft accent glow (`glass.plus`). It is the bar's only colored element. Its action and label follow the screen (New task / New habit / New routine); see [navigation](../product/navigation-and-modules.md#navigation-model).
- Hidden on Focus.

### Toast

- 40 tall, pill, `bg-ink`, `text-canvas`, 14 semibold, 15pt check icon, 16 side padding, `shadow-float`.
- Single instance, managed by a small provider. Copy rules in [interaction-patterns](../product/interaction-patterns.md#toast-copy).

### ProgressRing

- Sizes:
  - 44 (Plan header: 4 stroke on a `line-strong` track; number without "%" in 13 semibold; check icon at 100%; no progress arc at 0);
  - 56 (goals: 4 stroke);
  - 72 (desktop daily progress);
  - 250 (focus: 10 stroke, hue color).
- Track `line-strong` or `sunken`, progress `accent` or hue, round caps, starting at 12 o'clock.
- Use `react-native-svg` only if it is already installed or approved. Otherwise raise it as a dependency decision.

### EmptyState

- Optional illustration (max 120×96, drawn with tokens: sunken shapes, line-strong strokes, one accent element).
- Title in `type-heading`, one `type-body-sm` muted sentence.
- Optional chip action.
- Centered, 60 from the top of the content area.
- Examples: "Inbox zero", "A blank canvas", "Nothing here".

### Avatar / IconTile / HueDot

- **IconTile:** 32 (`rounded-tile` 10–12) or 40 (`rounded-tile` 12), hue background, white icon.
- **HueDot:** 5–7pt circle; in rows, a 1.5pt halo in the background color.

## States every interactive component needs

| State                     | Treatment                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Pressed                   | `active:` scale 0.96 or opacity 0.9 (primary button 0.98)                                                      |
| Selected / pressed toggle | `data-[pressed=true]` / `data-[checked=true]` styles + `accessibilityState`                                    |
| Disabled                  | `opacity-50`, no press feedback, `accessibilityState={{ disabled: true }}`                                     |
| Loading                   | Keep the size; replace the label with a small `ActivityIndicator` in the label color; disable presses          |
| Focus (keyboard/web)      | Platform focus ring; web 2pt accent outline, offset 2                                                          |
| Error                     | Field: border `danger`, message `type-meta` `text-danger` below. Screen: EmptyState-style message + Retry chip |

## Loading and errors (screens)

- **Loading:** the prototype has no network. In production, show skeletons that mirror the real layout:
  - `bg-sunken` blocks with the real radii (capsule-shaped rows on the timeline).
  - No spinners in the middle of empty screens.
- **Errors:** inline, near what failed, with a Retry chip. Never a blocking alert for recoverable errors. Validation errors use the toast copy ("Give it a name first") and keep the sheet open.

## Dialogs, dropdowns and menus

- The prototype uses **sheets** and **segmented controls** instead of dropdowns and dialogs. Keep it that way.
- For a choice among ≤ 6 options, use a segmented control or chips. For more, open a sheet with a list.
- System alerts only for irreversible, multi-item destruction (for example "Delete project and its 8 tasks"). One temporary exception: until the toast (ticket 06) and the editor (ticket 07) exist, the + shows a "Coming soon" alert.
- Context menus (long-press) are **Proposed**, not in the prototype.
