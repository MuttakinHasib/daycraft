# Accessibility (web)

Target: **WCAG 2.2 AA**.

## Semantic HTML first

- Buttons are `<button type="button">`, navigation is `<Link>`/`<a>`. Never put `onClick` on a `div` or `span`.
- Landmarks:
  - `<nav aria-label="Main">` for the sidebar;
  - `<main>`;
  - `<aside aria-label="Details">` for the right panel;
  - `<section aria-label="Timeline">`.
- One `<h1>` per page (the page title, or the date on Today). Card and panel titles are `h2`/`h3` in order.
- Form controls have labels: visible, or `sr-only`. Placeholders are not labels.
- Lists of things are `<ul>`/`<ol>` (nav items, Up next, Inbox, subtasks).

## ARIA (only where HTML is not enough)

- Toggles: `aria-pressed` (chips, habit chips, swatches) or `role="checkbox"` + `aria-checked` (check rings, subtasks, milestones).
- Current nav item: `aria-current="page"`. Selected date in the week strip: `aria-current="date"`.
- Segmented controls: a radiogroup or toggle buttons, applied consistently. Arrow keys move within the group.
- Icon-only buttons require `aria-label` ("Previous week", "Close details", "New task", "Delete").
- Expanding sections: `aria-expanded` + `aria-controls`.
- Toasts and timer state changes: `role="status"` (polite). Never use `role="alert"` for success messages.
- The focus timer exposes `role="timer"` with an accessible name. Announce start, pause and complete, not every second.

## Keyboard

- Everything works by keyboard in a logical order: the sidebar, the header (date, week strip), habits, the timeline in time order, then the aside.
- Rendering order equals visual order. The timeline uses absolute positioning, so render rows in sorted time order.
- **Enter** submits single-line fields (capture, subtasks, steps, project tasks). **Escape** closes dialogs and clears the selection in the detail panel.
- Dialogs trap focus and return it to the opener. After creating an activity from a slot, focus moves to the detail panel's title input.
- **Drag alternatives (required):**
  - Duration segments and a start-time stepper in the panel or editor. The stepper is required before launch, see W8.
  - Kanban uses Start → / Done → buttons.
  - Proposed: arrow-key moves on a focused capsule (see [timeline-guide](../product/timeline-guide.md#14-accessibility)).

## Focus visibility

The global `:focus-visible` outline (2px `accent`, 2px offset) must stay visible on every surface, including hue headers. Never use `outline-none` without a replacement.

## Pointer and touch

- Targets ≥ 24×24 (WCAG 2.5.8) everywhere and **≥ 44×44 on touch** (check ring hit area, chips via padding).
- Dragging has a single-pointer alternative (above).

## Color and contrast

- Text 4.5:1, large text and UI parts 3:1. Token pairs are pre-checked ([design-system](design-system.md#semantic-colors)). Check any new pair.
- Never rely on color alone:
  - done = strikethrough + filled ring;
  - event = "Event" tag;
  - priority = flag icon + word;
  - active = "Now · 50m left" text.

## Motion

- Respect `prefers-reduced-motion`: use the `motion-safe:` variant for movement (sheet-up, pop, reflow, scale), or turn it off in a reduced-motion media block.
- Color and opacity fades may stay.

## Zoom and text

- Layouts survive 200% zoom and 400% at 1280px (reflow) without horizontal scrolling of the page.
- Use `rem`-based type tokens (the defaults are rem), and never block user zoom.

## Tooling

Run automated checks (axe via Playwright once tests exist) and a manual keyboard pass on every new screen. See [testing](../development/testing.md).
