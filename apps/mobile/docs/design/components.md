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

### IconButton

- 40pt (`md`) or 32pt (`sm`), pill, `bg-sunken`, `text-ink`, icon 18 (sm: 16).
- Variants:
  - `ghost`: transparent background, for calendar arrows;
  - `onHue`: `bg-white/20`, white icon, for colored sheet headers;
  - `danger`: `text-danger`, for delete.
- `accessibilityLabel` is **required** (TypeScript-enforced).

### TextField

- 48pt.
- Variants:
  - `sunken`: `bg-sunken`, `rounded-field`, px 16 — editor location, step names;
  - `pill`: `bg-surface`, border `line`, `rounded-full`, with a trailing 36pt accent add button — capture fields;
  - `underline`: transparent, 1.5pt bottom border — title inputs in sheets.
- Placeholder color `ink-subtle` (`placeholderTextColorClassName`).
- Multiline variant: min height 88, 16 padding, `type-body`, line height 1.5.

### Card and ListGroup / ListRow

- **Card:** `bg-surface border border-line rounded-card p-4`.
- **ListGroup:** a card with no padding and hairline-separated **ListRow**s (min 52, px 16, gap 12; leading 32pt hue tile or 18pt subtle icon; trailing value in `text-ink-muted` tabular; optional chevron).

### TabBar (with the center +)

- Implementation choice is decision D1; the layout below is the design reference.
- **Bar:** one pill, 16 from each side and 24 above the bottom inset, h 64, p 6, `bg-elevated`, border `line`, `shadow-float`.
- **Order:** Plan · Habits · **+** · Goals · More. Tabs are `flex-1`, 52 tall, 22pt icon over an 11pt semibold label, gap 3.
  - Icons: Plan `timeline`, Habits `flame`, Goals `target`, More `grid`.
  - Active: `bg-sunken` pill + `text-accent-text` (`accessibilityState={{ selected: true }}`). Inactive: `text-ink-muted`.
  - More carries the Inbox badge: 18pt accent pill, 11pt bold count, 2pt `elevated` ring, offset to the right of the icon. Its label reads “More, 4 in Inbox”.
- **+ (center):** a 72-wide slot holding a 52 circle, `bg-accent`, 26pt plus (stroke 2.4). Its action and label follow the screen (New task / New habit / New routine); see [navigation](../product/navigation-and-modules.md#navigation-model).
- Hidden on Focus.

### Toast

- 40 tall, pill, `bg-ink`, `text-canvas`, 14 semibold, 15pt check icon, 16 side padding, `shadow-float`.
- Single instance, managed by a small provider. Copy rules in [interaction-patterns](../product/interaction-patterns.md#toast-copy).

### ProgressRing

- Sizes:
  - 44 (Plan header: 4 stroke on a `line-strong` track; number without “%” in 13 extrabold; check icon at 100%; no progress arc at 0);
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
- Examples: “Inbox zero”, “A blank canvas”, “Nothing here”.

### Avatar / IconTile / HueDot

- **IconTile:** 32 (`rounded-tile` 10–12) or 40 (`rounded-tile` 12), hue background, white icon.
- **HueDot:** 5–7pt circle; in rows, a 1.5pt halo in the background color.

## States every interactive component needs

| State | Treatment |
|---|---|
| Pressed | `active:` scale 0.96 or opacity 0.9 (primary button 0.98) |
| Selected / pressed toggle | `data-[pressed=true]` / `data-[checked=true]` styles + `accessibilityState` |
| Disabled | `opacity-50`, no press feedback, `accessibilityState={{ disabled: true }}` |
| Loading | Keep the size; replace the label with a small `ActivityIndicator` in the label color; disable presses |
| Focus (keyboard/web) | Platform focus ring; web 2pt accent outline, offset 2 |
| Error | Field: border `danger`, message `type-meta` `text-danger` below. Screen: EmptyState-style message + Retry chip |

## Loading and errors (screens)

- **Loading:** the prototype has no network. In production, show skeletons that mirror the real layout:
  - `bg-sunken` blocks with the real radii (capsule-shaped rows on the timeline).
  - No spinners in the middle of empty screens.
- **Errors:** inline, near what failed, with a Retry chip. Never a blocking alert for recoverable errors. Validation errors use the toast copy (“Give it a name first”) and keep the sheet open.

## Dialogs, dropdowns and menus

- The prototype uses **sheets** and **segmented controls** instead of dropdowns and dialogs. Keep it that way.
- For a choice among ≤ 6 options, use a segmented control or chips. For more, open a sheet with a list.
- System alerts only for irreversible, multi-item destruction (for example “Delete project and its 8 tasks”).
- Context menus (long-press) are **Proposed**, not in the prototype.
