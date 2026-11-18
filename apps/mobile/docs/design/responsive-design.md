# Responsive design

## Targets for this repo

| Target | Size (pt) | Status |
|---|---|---|
| iPhone (reference) | 390 × 844 | Primary design size |
| iPhone small | 375 × 812 | Must work: verified in the prototype (Calendar header fits on one line at this width) |
| iPhone large | 430 × 932 | Must work: layouts are fluid, nothing scales up |
| iPad | 768 × 1024 and up | Not designed yet. App is `orientation: portrait`. Proposed: reuse the desktop pattern (rail + timeline + detail panel). |
| Android phones | 360–412 wide | Second platform; same layouts |
| Web / desktop | 768 / 1440 / 1920 | Separate Next.js app (decision D3). The prototype boards “v2 · Desktop 1440”, “Tablet 768” and “Large desktop 1920” are its reference. |

## Mobile-first rules

- Layouts are fluid in width and fixed in rhythm. Use flex and padding tokens; never fixed screen widths. The only fixed widths are component sizes (capsule 48, buttons, chips) and the kanban column (250).
- Design at 375 first, then confirm 390 and 430. At 375, every header row, chip row and editor row must fit without wrapping, or scroll horizontally on purpose. Calendar's title uses `type-heading` for exactly this reason.
- Overflow:
  - Peers (filters, habits, milestones, kanban) → horizontal scroll with no visible scrollbar.
  - Text → truncate on the timeline, wrap elsewhere.
  - Never allow horizontal page overflow.
- Respect the safe area at top and bottom. The floating tab bar and + sit 24 from the screen's bottom edge, over the home indicator (as in the design); the toast sits above the bar.
- Dynamic Type: the layout must survive the largest standard size. Rows grow vertically; nothing clips. The timeline's row heights grow with text, so use measured text heights in the layout function if Dynamic Type increases them. **Proposed;** the prototype uses fixed 48/80.

## Timeline across sizes

- Phone: 1.1 pt/min, 48pt capsule, text column from x 112.
- Wider screens: **do not scale the capsule or the type.** Extra width goes to the text column (and on desktop to a side detail panel). See [timeline-guide](../product/timeline-guide.md#15-desktop-differences).

## Sheets and modals across sizes

- Phone: bottom sheets, full width.
- iPad / desktop (proposed for iPad, implemented on desktop): a detail panel beside the timeline instead of a sheet. Editors may still open as centered form sheets.

## Desktop reference (for the web app)

From the prototype, for consistency between the two apps:

- Sidebar 248 (nav items 40 tall, 12 radius, active = `accent-soft` + `accent-text`).
- Main padding 24/32/32.
- Content max width 1360, centered.
- Panels 24 radius. The details panel is 340 basis / 420 max.
- At ≤ 1100 container width the sidebar becomes an 80pt icon rail and the details panel moves below the timeline at full width (container query, not viewport).
- At 1920 the content stays capped at 1360; it never stretches.
