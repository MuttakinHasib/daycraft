# Timeline guide

The Plan timeline is Daycraft's core surface. Everything in this file describes the **implemented prototype behavior** (canvas page "v2 · Current", boards "v2 · iPhone 390/375"). Screenshots: [today-1440-dark.png](../../../../docs/design/reference/screens/desktop/today-1440-dark.png), [phone plan.png](../../../../docs/design/reference/screens/phone/dark/plan.png). The reference implementation of every rule below is the `layout()` / `pDown` / `pMove` / `pUp` code in [prototype/desktop-dark.html](../../../../docs/design/reference/prototype/desktop-dark.html). Items marked **Proposed** are not in the prototype. Do not build them without approval.

> Has a mobile counterpart in `apps/mobile/docs/product/`. The web app uses the **Desktop** column wherever the two differ; "pt" means CSS px here, and "tap" means click. Desktop values are verified against the boards "v2 · Desktop 1440 / Tablet 768 / Large desktop 1920".

## 1. Anatomy

```text
 gutter (time labels)   capsule    spine     text column                      check ring
 ┌──────────┐        ┌──────┐                ┌───────────────────────────┐      ┌──┐
 │   9:30   │        │      │                │ 9:30–11:30 AM (2 hr)  ↻ ⚑ │      │○ │
 │          │        │  ▭   │                │ Deep work · Onboarding fl… │      └──┘
 │  10:40 ──┼────●───┼──────┼── now line ─── │ [● Now · 50m left] [☑ 2/4›]│
 │          │        │  ═   │ ← resize grip  └───────────────────────────┘
 └──────────┘        └──────┘
```

| Element | Phone | Desktop |
|---|---|---|
| Gutter labels | right-aligned, x 4–44 | x 8–60 |
| Capsule | left 52, width 48, radius 24 (pill), min height 48 | left 68, width 48 |
| Spine | 2px wide, centered on the capsule (x 75) | x 91 |
| Text column | left 112, right 56 | left 128, right 60 |
| Check ring | 24pt, right 20, top 12 (centered on the first 48pt of the capsule) | right 24 |
| Hour lines / slots / now line start | x 52 | x 68 |
| Top padding inside the scroll content | 18 | 18 |

The timeline sits inside the Today panel (`surface`, `radius-sheet` top corners) below the habit row. The text column never overlaps the ring; titles truncate with an ellipsis on one line.

## 2. Time scale and range

- Range: from the first timed activity's start to where the last one ends, so the timeline opens and closes on an activity, never on a bare hour line. On today the range also stretches to the current time, so the now line always shows. An empty today shows the current hour and the next four; an empty other day shows 8:00 AM to 6:00 PM. The range never leaves 5:00 AM to midnight (`D0 = 300`, `D1 = 1440` minutes; call the range `R0` to `R1`), which is still where drag and the editor can place an activity. Before 5:00 AM the now line is hidden. Half-hour slots start on the first :00 or :30 inside the range.
- Scale: **1.1 pt per minute** on phone (66 pt/hour), **1.25** on desktop.
- Times are local wall-clock minutes of day (see [architecture](../development/architecture.md#dates-and-time)).

## 3. Layout algorithm (push-down + anchored time map)

The timeline is proportional to time, but blocks never overlap visually. Implement this as a **pure function** in `packages/domain/src/timeline/` with unit tests. The UI only renders its output.

1. Take the date's **scheduled** activities (`start !== null`) and sort them by `start`, then by `durationMinutes`.
2. For each activity:
   - `capsuleHeight = durationMinutes > 0 ? max(48, durationMinutes × S) : 48`. Zero-duration activities render as a 48pt circle.
   - `hasMeta` is true if the activity has subtasks, is an event, or is active (see §6).
   - `rowHeight = max(capsuleHeight, hasMeta ? 80 : 48)`.
   - `top = (start − R0) × S + 18 + offset`. If `top < previousRowBottom + 12`, push it down to `previousRowBottom + 12` and add the difference to `offset`. The minimum gap between rows is 12.
3. Build **anchors** `(minute, y)`:
   - Start with `(R0, 18)`. A zero-duration activity at `R0` moves this anchor to its circle center.
   - Per activity with duration: add `(start, top)` and `(start + duration, top + capsuleHeight)`.
   - Per zero-duration activity: add `(start, top + 24)`.
   - Clamp each anchor so both minute and y are non-decreasing.
   - End with `(R1, lastY + (R1 − lastMinute) × S)`.
4. `mapTimeToY(minute)` interpolates linearly between anchors. Every time-based element (hour labels, half-hour slots, now line) uses this map. That keeps them consistent with pushed-down blocks: free time stretches or compresses, while blocks keep their real start.
5. Content height = `max(last anchor y, last row bottom) + 150` on phone (`+ 60` on desktop), so the last block can scroll above the tab bar.

**Overlapping activities** (two activities whose times intersect) are stacked by this same push-down. There are no side-by-side columns. **Proposed:** a visual overlap marker or side-by-side layout for true conflicts. Not implemented.

## 4. Time labels

- **Activity start labels:** `micro` (11) / semibold / `ink-muted`, tabular figures, format `9:30` (no AM/PM). Each sits at the row's top + 3; a zero-duration activity without a meta line centers its start label and its text column on the circle instead. Hidden when within 16pt of the now line.
- **Hour labels:** `micro` / medium weight / `ink-subtle`, format `9 AM`, at `mapTimeToY(h × 60)`. Each comes with a 1px `line` hairline from x 52 to the right padding. An hour label is **only shown in free space**: hide it if it falls within any row's `[top − 12, top + rowHeight + 6]` or within 18pt of the now line.
- Hours shown: every whole hour inside `R0` to `R1`, never midnight.

## 5. The spine

Draw one 2px segment between each pair of consecutive capsules, from the bottom of capsule A to the top of capsule B.

- **Gap under 45 min:** a solid vertical gradient from A's hue to B's hue.
- **Gap of 45 min or more:** dashed in `line-strong` (5pt dash, 5pt gap).
- When both neighbors are done, the segment is at 45% opacity.
- The spine animates `top`/`height` with the rows (220ms ease).

## 6. Capsule states

| State | Rule | Capsule | Text | Ring |
|---|---|---|---|---|
| **Upcoming** | not done, not active | solid hue, `on-hue` (white) icon (22pt) | title `activity` in `ink`; time line `meta` in `ink-muted` | 2px hue border, empty |
| **Active** | date is today, not done, `start ≤ now < start + duration`, duration > 0 | base = 42% hue mixed into `surface`; the elapsed part (from the top, % of duration) is solid hue; 4pt outer ring of hue at 28% | adds an `accent-soft` tag: dot + "Now · 50m left" | upcoming style |
| **Done** | `done` | 45% opacity | title struck through, `ink-subtle` | filled with the hue, `on-hue` 14pt check (3.2 stroke), pop animation |
| **Dragging** | being moved or resized | `shadow-lift`, no position transition, raised above other rows | a time pill (`ink` background, `canvas` text) floats 30pt above the text column showing the new range | None |
| **New** (just created/added) | for ~0.9s after creation | pop animation (scale 0.6, then 1.12, then 1) | None | None |

**Meta row** (8pt below the title), only when it has content:

- the active tag;
- a subtasks tag `☑ 2/4 ›`;
- for events, a location tag (`pin` icon + location, or "Event").

The desktop also shows labels as tags. Repeat (↻) and high-priority (⚑, `danger`) icons sit inline after the time text.

The time text format is `9:30–11:30 AM (2 hr)`:

- The AM/PM suffix is shared when both times are on the same side of noon.
- Durations read "45 min", "1 hr 30 min".
- Zero-duration activities show just the time.

## 7. Now line (current-time indicator)

- Only on today.
- Position: `mapTimeToY(now)`.
- A 1.5pt `accent` line at 50% opacity spans from x 52 to the right padding. A 10pt `accent` dot with a 3pt `surface` halo sits on the spine.
- The gutter label shows the time (`10:40`) in `micro` / extrabold / `accent-text`.
- It sits **behind** capsules and text (z-index below rows). When "now" is inside the active capsule, the capsule's fill shows progress instead.
- The prototype freezes now at 10:40 AM. **Production:** update every minute (align the timer to the next minute boundary), and recompute active state and elapsed fill.

## 8. Free time (gaps)

Between consecutive activities, if the gap is ≥ 60 min **and** ≥ 76pt of vertical space (60pt desktop), and the gap is not in the past on today, show a hint in the text column:

- Clock icon + **"1h 30m"** (`accent-text`, bold) + " free before Write Q4 roadmap draft".
- If now is inside the gap: "**50m** left, then Design sync", placed 16pt below the now line.
- A small **Add task** chip (with an accent + circle). It opens the editor at the gap start (or the next 15-minute mark after now). The duration is the gap rounded down to 15 min, clamped to 15–60.

## 9. Creating from empty time

- The whole timeline is covered by **30-minute slot targets**, from x 52 to the right padding, behind the rows. A slot is rendered only if it is at least 14pt tall in the time map.
- Tapping a slot opens the editor with that start time and a 30-minute duration.
- On pointer hover (desktop/web), the slot tints with 6% accent and shows "+ 9:30 AM".
- **Desktop (this app):** clicking a slot creates a "New task" at that time immediately and selects it in the right panel, where the title is editable. The toast reads "Task added · 9:30 AM. Rename it on the right".
- Each slot has the accessibility label "Add something at 9:30 AM".

## 10. Drag to move, drag to resize

- **Move:** press on the capsule and drag vertically.
- **Resize:** press on the bottom grip and drag. The grip is an 18pt-tall area at the bottom of capsules with duration ≥ 15 min, showing a 16×3 `on-hue` (white) bar at 75%.
- **Threshold:** movement under 6pt is a tap. A tap opens the detail sheet; a drag must not also trigger it (suppress the press for ~80ms after a drag).
- **Snap:** `deltaMinutes = round(dy / S / 5) × 5`. All times move in 5-minute steps.
- **Clamp:** move keeps `start` within `[D0, D1 − max(duration, 5)]`. Resize keeps `duration` within `[5, D1 − start]`. The editor applies the same limits (one rule in `@daycraft/domain`): nothing starts before 5:00 AM or ends after midnight.
- **During drag:** layout is recomputed with the preview values, so other rows reflow (they animate; the dragged row does not). The floating time pill shows the new range.
- **On release:** commit, then show a toast: "Moved to 11:15 AM–12:15 PM" or "Now 1 hr 15 min · ends 12:45 PM".
- **Cancel** (gesture interrupted): revert to the original values.
- **Web implementation (as in the prototype):**
  - Pointer Events on the capsule and on the grip: `pointerdown` calls `setPointerCapture`, then `pointermove` and `pointerup`/`pointercancel`.
  - `touch-action: none` on the capsule and grip so touch drags do not scroll.
  - Keep the in-progress drag in a ref plus a single preview state for rendering.
  - Commit on release.
  - The grip calls `stopPropagation()` so it does not also start a move.
- Do not use HTML5 drag-and-drop (`draggable`) for the timeline.

## 11. Scrolling

- On mount and whenever the date changes or Today regains focus, scroll so that:
  - today: the now line is 170pt below the top (desktop 220);
  - any other date: the first activity is 10pt below the top.
- **Proposed:** long-press on the top or bottom edge while dragging to auto-scroll.

## 12. Date navigation

- **Week strip:** tap a day; ‹ › moves ±7 days and keeps the weekday.
- **Month picker sheet:** month and year title with ‹ ›, a 7-column month grid (52pt cells) with hue dots. Tapping a day selects it and closes the sheet.
- The **Today** chip appears when another date is selected.
- Habits: checking in on a future date is blocked with the toast "Habits can be checked in on or before today".

## 13. Empty day

When a date has no scheduled activities, the text column shows (no timeline chrome other than slots):

- "A blank canvas" (`heading`);
- "Nothing planned for this day yet. Tap any hour to drop something in, or start from a routine." (`body-sm`, muted);
- an accent chip **+ Plan this day** that opens the editor.

## 14. Accessibility

- Capsule `aria-label`: "Deep work · Onboarding flow, 9:30–11:30 AM. Drag to move, drag the bottom grip to resize."
- Text column label: "Open {title}".
- Check ring: checkbox with the label "Complete: {title}" / "Mark not done: {title}".
- **Drag alternative (required):**
  - The detail panel's Duration segments change the length.
  - The editor's time stepper (−15 / +15 min) changes the start.
  - Keyboard and screen-reader users must be able to reschedule without dragging. The desktop panel does not have a time stepper yet; adding one is required before launch (record it in status).
- **Proposed:** keyboard control of a focused capsule. The up and down arrow keys move it by 5 minutes (15 with Shift), and Alt with an arrow key resizes it. Both call the same commit function and announce the new time through a polite live region.
- Respect `prefers-reduced-motion`: no reflow animation, no pop (see [accessibility](../design/accessibility.md)).
- Capsules and text columns are `<button>`s; slots are `<button>`s with labels; the check ring is a real checkbox control (`role="checkbox"` / `aria-checked`, or `<input type="checkbox">`).

## 15. Desktop differences

- The timeline sits in a 24-radius panel (fixed scroll height 700) with a horizontal habit **chip** row on top instead of circles.
- Selecting a row tints it (`sunken` at 60%) and opens the right-hand detail panel (editable title, duration, color, subtasks, notes, inline focus timer) instead of a sheet.
- Everything in §2–§12 is otherwise identical, including the 48pt capsule.
