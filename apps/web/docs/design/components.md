# Components

Button, Chip, Tag, Segmented, CheckRing, Capsule, SectionLabel, Field, Card and Sheet exist as component classes in `src/app/globals.css` and are specified once for both apps in the root [components](../../../../docs/design/components.md); they render on `/design-system`. When a screen needs one as a React component, build it in `src/components/ui/` on top of those classes, keeping the props of the mobile primitive (`variant`, `size`, `selected`, `hue`, …). The table below keeps the web-only details and the components not built yet.

Conventions:

- Named exports; `interface XProps`; defaults in destructuring.
- State expressed with ARIA/data attributes and styled with variants (`aria-pressed:`, `aria-selected:`, `aria-current:`, `data-[state=active]:`).
- `"use client"` only on components that need interactivity. Presentational pieces (Tag, SectionLabel, Card) stay server-compatible.
- Accept `className` only for **layout** overrides (margin, width, flex). Visual variants are props, not class overrides.

## Core primitives

| Component | Spec |
|---|---|
| **Button** | `variant: 'primary' \| 'secondary'`, `size: 'lg' \| 'md'`. lg h 52, md h 44; pill, `type-body font-semibold`, optional leading 17–18px icon, gap 8. Primary `bg-accent text-on-accent hover:bg-accent-hover`; secondary `bg-sunken text-ink`. `active:` scale .98. Real `<button>`. |
| **IconButton** | sizes 40 / 32 (`sm`), pill, `bg-sunken text-ink`, 18 / 16 icon. Variants `ghost`, `onHue` (`bg-ink/10 text-on-hue`, for hue-tinted headers), `danger` (`text-danger`). **`aria-label` is required** in the type. |
| **Chip** | h 36 (sm 32), pill, px 16 (sm 12), `text-control`, `bg-sunken text-ink-muted`. Pressed toggle chips (`aria-pressed`) are `bg-ink text-canvas`. Tones: `accent` (`bg-accent text-on-accent`), `accentSoft` (`bg-accent-soft text-accent-text`). Optional leading icon. |
| **Tag** | h 24, pill, px 8, gap 4, 12 semibold, `bg-sunken text-ink-muted`. Tones: `accentSoft`, hue-tinted (events). Optional 12px icon. Not interactive. |
| **Segmented** | track `bg-sunken rounded-tile p-0.75 flex gap-0.5`; buttons h 32, `rounded-segment` (track radius minus padding), `type-control text-ink-muted`; selected `bg-raised text-ink shadow-thumb`. Use `role="radiogroup"` + `role="radio"`/`aria-checked`, or `aria-pressed` toggle buttons, consistently. Arrow-key navigation inside the group. |
| **CheckRing** | 24px circle, 2px border in the activity hue; checked: hue fill, white 14px check (3.2 stroke) with the pop animation. Hit area 44 (`::after` inset −10px, as in the reference CSS `.check-ring`). `role="checkbox"` + `aria-checked` (or a visually hidden native checkbox). |
| **Capsule** | width 48, min height 48, `rounded-capsule`, hue background, white 22px icon, `touch-action: none`. States `data-state="idle" \| "active" \| "done"`: active is a 42% hue mix with the elapsed part solid and a 4px 28% ring; done is `opacity-45`. Optional bottom resize grip (18px area, 16×3 bar `bg-white/75`). Renders as a `<button>`. |
| **SectionLabel** | `type-label uppercase text-ink-subtle`. |
| **Card / Panel** | Card `bg-card rounded-card p-4` (no border); Panel `rounded-panel` + p-5. |
| **ListGroup / ListRow** | Bordered container with `divide-y divide-line`; rows min 44, px 16, gap 12; leading icon or hue tile; trailing muted value. |
| **TextField** | Variants `sunken` (h 48, `bg-sunken rounded-field px-4`), `pill` (h 40–48, `bg-surface` or `bg-sunken`, `rounded-full`, trailing 32–36 accent add button), `underline` (transparent with a bottom border, used for title inputs on hue-tinted headers with `text-ink placeholder:text-ink-muted`). Always paired with a `<label>` (visible or `sr-only`). Textarea: min h 88, p 12/16, `leading-normal`. |
| **ColorSwatches** | 9 hue buttons, 32 (28 in the desktop panel), pill; selected: `ring-2 ring-surface` inside an outer `ring-ink` (two-ring look). `aria-label` = hue name, `aria-pressed`. |
| **ProgressRing** | SVG; sizes 40 / 56 / 72 / 250; track `line-strong` or `sunken`, progress `accent` or hue, round caps, starts at 12 o'clock (`-rotate-90`), `transition-[stroke-dasharray]`. `role="img"` + `aria-label` ("32% of today done"). |
| **Toast** | h 40, pill, `bg-ink text-canvas`, 14 semibold, 15px check icon, px 16, `shadow-float`, fixed bottom 24 center, `role="status"`. A single instance from a client provider in the root layout. |
| **EmptyState** | Optional token-colored illustration (≤ 120×96), `text-heading` title, one `text-body-sm text-ink-muted` sentence, optional chip action. |

## App-shell components (from the desktop prototype)

| Component | Spec |
|---|---|
| **Sidebar / NavItem** | See [navigation-and-modules](../product/navigation-and-modules.md#app-shell). NavItem is a `<Link>` with `aria-current="page"` when active; 40 tall, `rounded-tile`; active `bg-accent-soft text-accent-text`; hover `bg-sunken text-ink`. |
| **WeekStrip** | Container pill (`bg-card rounded-panel p-1`); 7 day buttons 52×56, `rounded-card`; selected `bg-accent text-on-accent`; today's number `text-accent-text`; hue dots 5px. Arrow buttons are separate IconButtons. |
| **HabitChip** | h 36, pill, `pl-1.5 pr-3`, a 26 hue circle + name; not done: dashed `border-line-strong`; done: hue 16% background, check icon. `aria-pressed`. |
| **DetailPanel** | See [navigation-and-modules](../product/navigation-and-modules.md#today-desktop). Header band uses the activity hue (`style` from the hue variable) with white text. |
| **Dialog** | For create flows on desktop. Centered, max width ~480, `rounded-panel bg-surface shadow-float`, scrim `bg-scrim`, focus trapped, Escape closes, focus returns to the opener. Use the native `<dialog>` element (`showModal()`) unless a requirement rules it out. |

## States

| State | Treatment |
|---|---|
| Hover (pointer) | Background or color shift only (`hover:bg-sunken`, `hover:bg-accent-hover`), 150–200ms |
| Pressed | `active:scale-[.96]` (buttons .98) |
| Selected | `aria-pressed` / `aria-selected` / `aria-current` + matching variant styles |
| Focus | Global `:focus-visible` outline (2px accent, offset 2) |
| Disabled | `disabled:opacity-50 disabled:pointer-events-none` on a real `disabled` attribute |
| Loading | Keep the size; spinner in the label color; `aria-busy="true"`; disable the control |
| Error | Field `border-danger` + `text-meta text-danger` message linked with `aria-describedby` |

## Loading and errors (pages)

- Use `loading.tsx` / `<Suspense>` fallbacks that are **skeletons of the real layout**:
  - `bg-sunken` blocks with real radii;
  - capsule-shaped placeholders on the timeline;
  - no centered spinners.
- `error.tsx` per route segment: an EmptyState-style message, `text-danger` only for the icon or title accent, and a **Try again** chip that calls `reset()`.
- Validation errors use the toast copy from [interaction-patterns](../product/interaction-patterns.md#toast-copy) and keep the dialog or panel open.

## Menus and dropdowns

The prototype uses segmented controls, chips and panels instead of dropdowns. Keep it that way:

- up to 6 options: a segmented control or chips;
- more than 6: a dialog with a list.

Context menus and native `<select>` are **Proposed** only.
