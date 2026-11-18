# Responsive design

## Targets

| Width | Layout | Verified in prototype |
|---|---|---|
| 1920 × 1080 | Full sidebar; content capped at 1360 and centered; timeline + aside side by side | yes ("Large desktop 1920 · light") |
| 1440 × 900 | Reference desktop | yes ("Desktop 1440") |
| 1100 container and below | Sidebar → 80px icon rail; main padding 24; aside wraps under the timeline at full width | yes ("Tablet 768") |
| 768 × 1024 | Rail + timeline + aside stacked | yes |
| < 768 | Undecided (W3). Must not overflow horizontally. | no |

## How

- **Container queries, not viewport media queries**, for the app shell. The root is an `@container`; the rail switch happens at `@max-[1100px]` (Tailwind v4 container variants). The layout then behaves the same inside any frame (preview panes, split screens).
- Use viewport breakpoints only for page-level concerns that truly depend on the window.
- Mobile-first inside components:
  - write the narrow layout;
  - add `@min-*` or `md:`/`lg:` variants for wider ones;
  - use `flex-wrap` with flex-basis so panels reflow without breakpoints (the prototype's timeline `flex: 999 1 460px` + aside `flex: 1 1 340px` pattern).
- Rail mode hides labels with a `rail-hidden`-style utility on the container query. Every icon-only control keeps an `aria-label`.

## Rules

- No horizontal page scroll at any width ≥ 320, and at 200% zoom.
- Fixed widths only for components (capsule 48, week-day 52, sidebar 248/80, aside max 420, kanban column 250). Everything else is fluid.
- Peers that overflow (habit chips, filters, milestones, kanban) scroll horizontally inside their container, without a visible scrollbar (as in the prototype).
- Do not scale type or capsules up on large screens. Extra width goes to the timeline's text column, and space beyond 1360 stays as margin.
- Touch (tablets): targets ≥ 44px; `touch-action: none` only on draggable capsules and grips; hover-only affordances (slot "+ 9:30 AM" hints) must have a tap or keyboard equivalent. Slots are buttons, so they do.
- Panels vs dialogs: the right detail panel is used whenever the aside is visible (all target widths). Create flows use a centered dialog that fits within 92vw and 90dvh and scrolls internally.

## Verification widths

Check **768, 1024, 1440 and 1920**, plus 375 for "does not break" until W3 is decided. Check each in light and dark (see [testing](../development/testing.md)).
