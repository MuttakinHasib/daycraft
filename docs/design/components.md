# Components

One spec for both apps: names, props, sizes, states and accessibility. Each platform implements its own (no shared React code): mobile as primitives in `apps/mobile/src/components/ui/`, web as component classes in `apps/web/src/app/globals.css` (and React components as screens need them). Both render on the `/design-system` page. Specs for components not built yet live in each app's `docs/design/components.md`.

Shared rules:

- Pills are `rounded-full`. Sizes below are in pt (mobile) and px (web).
- Toggle classes with the app's configured `cn` in object notation ([rule](../agents/rules/cn-object-notation.md)).
- Pressable things have a role, a state and a label; touch targets are at least 44.
- Icons are `Icon` from `@daycraft/icons` (`colorClassName` on mobile, `currentColor` on web).

| Component | Mobile | Web | Spec |
|---|---|---|---|
| **Button** | `<Button variant size icon disabled>` | `.btn-primary`, `.btn-secondary`, `.btn-md` | `variant`: primary (`accent`, `on-accent` text) or secondary (`sunken`, `ink` text). `size`: lg 52 tall (the main action), md 44. Full width, gap 8, optional 18 icon, `type-body` semibold. Disabled at 50% opacity. Role button |
| **IconButton** | to build | `.icon-btn`, `.icon-btn-sm` | 40 circle (32 small) on `sunken`, 18 icon. Needs a label |
| **Chip** | `<Chip selected size icon>` | `.chip`, `.chip-sm`, `aria-pressed` | md 36 tall, padding 16, gap 6; sm 32, padding 12, gap 4. `sunken` with `ink-muted` text; selected: `ink` with `canvas` text. `type-control`, 16 icon. Role button with selected state |
| **Tag** | `<Tag icon>` | `.tag` | 24 tall, padding 8, gap 4, `sunken`, 12px semibold `ink-muted`, 12 icon. Not interactive |
| **Segmented** | `<Segmented options value onChange accessibilityLabel>` | `<Segmented options value onChange label>` (`src/components/ui/segmented.tsx`) | Track: `sunken`, `rounded-tile`, padding 3, gap 2. Segment: 32 tall, `type-control` `ink-muted`, `ink` when selected. One `elevated` pill with a small shadow and `rounded-segment` springs to the selected segment (`spring-snap`; no movement under Reduce Motion). Roles tablist and tab (mobile), group and pressed buttons (web) |
| **CheckRing** | `<CheckRing checked hue accessibilityLabel>` | `.check-ring` + hue border and fill classes | 24 ring, 2 border in the activity's hue, 44 target. Done: filled with the hue and an `on-hue` 14 check (stroke 3.2), pop animation. Role checkbox; label "Complete: {title}" or "Mark not done: {title}" |
| **Capsule** | `<Capsule hue state height>` | `.capsule` + `data-state` | 48 wide, min 48 tall, `rounded-capsule`. Fill: the solid hue. 22 icon in `on-hue` (white). Active: 4 ring of the hue at 28%; the elapsed part is the solid hue. Done: 45% opacity. See the [timeline guide](../../apps/mobile/docs/product/timeline-guide.md) |
| **SectionLabel** | `<SectionLabel>` | `.section-label` | `type-label`, uppercase, `ink-subtle` |
| **Field** | to build | `.field` | 48 tall, `rounded-field`, `sunken`, padding 16, gap 12, `type-body` |
| **Card** | to build | `.card` | `rounded-card`, `card` fill, no border, padding 16. List groups use the same fill with `line` hairlines between rows |
| **Sheet / panel** | `<Sheet>` (bottom sheet) | `.sheet`; the desktop uses a right-hand panel | Sheet: `surface`, `rounded-sheet` top corners, `shadow-float`, sheet-up motion. Platform-specific: phone sheets become the desktop right panel or a centered dialog |
| **Icon** | `<Icon name size colorClassName>` | `<Icon name size className>` | See [design system → Icons](design-system.md#icons) |
| **TabBar** | `<TabBar>` (`tab-bar.tsx`) | — (desktop uses the sidebar) | Floating pill, `elevated`, `line` border, `shadow-float`. Order Plan · Habits · + · Goals · More. Active tab: solid `accent` pill with `on-accent` icon and label; inactive: `ink-muted`. Center +: 52 circle in `ink` with a `canvas` 26 icon. More badge: `clay` with `on-hue` count. See [ADR-0003](../adr/0003-custom-floating-pill-tab-bar.md) |
