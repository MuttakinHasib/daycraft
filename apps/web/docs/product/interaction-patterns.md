# Interaction patterns

> Has a mobile counterpart in `apps/mobile/docs/product/`. Web specifics: phone **sheets** map to the desktop **right detail panel** (selected activity) or a centered dialog (create/edit flows that do not start from a selection); hover states exist; Escape closes panels and dialogs.

The shared behaviors every screen uses. Component dimensions are in [components](../design/components.md). The timeline's own gestures are in [timeline-guide](timeline-guide.md).

## Feedback: every action answers

Every state-changing action gives **immediate visible feedback**:

- the state change itself (ring fills, item disappears, sheet closes);
- plus a **toast** for anything that is not obvious on screen (saved elsewhere, moved, deleted, captured).

Silent success is a bug.

### Toast copy

Short, past tense or state, with a middle dot `·` separating the object. No exclamation marks, no emoji.

| Action                | Toast                                                                      |
| --------------------- | -------------------------------------------------------------------------- |
| Complete / uncomplete | `Done · {title}` / `Marked as not done`                                    |
| Create                | `Task added · Today, 10:45 AM` · `Event added · Thu, Nov 19, 3:00 PM`      |
| Edit                  | `Saved · Today, 2:30 PM`                                                   |
| Move / resize         | `Moved to 11:15 AM–12:15 PM` · `Now 1 hr 15 min · ends 12:45 PM`           |
| Delete                | `Deleted · {title}` (Proposed: with **Undo**, see D5)                      |
| Habit                 | `{name} · checked in` / `{name} · unchecked`                               |
| Routine added         | `{routine} added · 7:30–8:15 PM`                                           |
| Capture               | `Captured to Inbox`                                                        |
| Validation            | `Give it a name first` · `Name your habit first` · `Add at least one step` |
| Theme                 | `Light appearance` / `Dark appearance`                                     |

Toast behavior:

- One toast at a time; a new one replaces the current one.
- Auto-dismiss after 2.4s.
- Positioned above the tab bar.
- On screen readers it is a polite live announcement (`role="status"` / `aria-live="polite"`).

## Sheets

- Every create and edit flow opens in a **bottom sheet**. Full-screen screens are reserved for Focus.
- **Opening:** the sheet slides up (`sheet-up`: 48pt, 340ms, `ease-snap`) and the scrim fades in.
- **Closing:** tap the scrim or × (top-left), or swipe down (native sheet).
- **Sheet types:**
  - **Activity sheet** (one sheet to open, edit and create tasks and events; canvas row "Activity sheet" on the v3 page):
    - **Opens editable.** Tapping a capsule, a list row or a search result opens the sheet with every field live. There is no read-only view, no pencil and no separate edit screen.
    - **Header band** in the activity hue: × (close) on the left; ⋯ (more) on the right for existing activities. Below: the 56pt icon tile, the time line ("9:30–11:30 AM (2 hr)"), the title as an inline text field, and the check ring (existing only). A new activity shows a **Task / Event** segmented control in place of ⋯ and has no check ring.
    - **Rows card** (`card`, 22 radius, 56pt rows, 22pt icons in the activity hue, value, muted hint, chevron):
      - Date: "Tue, Nov 17" · "Today" / "Tomorrow" / "Yesterday" → the **Date sheet**;
      - Time: "9:30–11:30 AM" · "2 hr" → the **Time sheet**;
      - Alert: "1 alert" · "At start" → the **Alert sheet**.
    - **Pills** (48pt, `card`): Repeat (Never / Every day / Weekdays / Every week), Priority (tasks), Colour (hue and icon). Events show Location instead of Priority. Each opens its own small sheet.
    - **Subtasks and notes card:** tickable subtasks, an "Add subtask" field (Return adds the next), a hairline, then the notes field.
    - **Delete task / Delete event:** a full-width `card` button with `danger` text, existing activities only.
    - **⋯ menu:** Start focus (tasks), Duplicate, Move to Inbox (tasks), a separator, Delete (`danger`).
  - **Saving:**
    - **Save changes** is hidden while the sheet matches what is saved. The first change (title, date, time, alert, repeat, priority, colour, notes, adding or renaming subtasks) slides it up from the bottom (`sheet-up`), pinned 30pt above the safe area. Saving writes, toasts `Saved · Today, 9:30 AM`, and the button slides away; the sheet stays open.
    - **Instant actions don't wait for Save:** the check ring and subtask ticks save at once with their usual toast, as on the timeline.
    - **New activities** show the primary button from the start, reading **Add to timeline** (scheduled task), **Add task** (Anytime) or **Add event**, disabled until the title is not blank.
    - **Closing:** a clean sheet closes on × or swipe down. A sheet with unsaved changes blocks the swipe and shows an action sheet: "You have unsaved changes." · **Discard changes** (`danger`) · **Keep editing**.
    - **Delete** asks first: "Delete “{title}”? This can’t be undone." · **Delete task** · **Cancel**.
  - **Date sheet:** month title, **Today** and ×; a Sunday-to-Saturday grid with up to two activity dots per day; the selected day is an `ink` circle, today is `accent` text. Picking a day sets it and closes the sheet.
  - **Time sheet:** "Starts" stepper (−15 / time / +15); a **Duration** wheel (hours 0–12, minutes 0 / 15 / 30 / 45) on `card` with the selection band in `raised`; preset chips 15m 30m 45m 1h 1h 30m 2h; **Done**. Tasks also get the Timeline / Anytime switch here when Anytime is available.
  - **Alert sheet:** None / At start / 5 min before / 15 min before / 1 hr before (one alert for now); picking one closes the sheet.
  - **On the desktop** the activity sheet is the right-hand panel and its small sheets are popovers; the rules are the same.
  - **New habit / New routine / Month picker:** plain header (title in `heading` + close).
- Switching a task from Anytime to Timeline restores the last start time. An event can never be unscheduled.

## Completing things

- Check rings toggle (`checkbox` role). Completing an activity **also completes all its subtasks**. Uncompleting leaves subtasks as they are.
- Subtasks toggle individually in the activity sheet, saved at once.
- Habits toggle per date. Future dates are blocked (see the habit toast in [timeline-guide](timeline-guide.md#12-date-navigation)).
- Done items: struck through, muted, and kept in place (not hidden) on the timeline. Tasks' Done filter lists them.

## Creating

| Entry point                                                   | Opens                              | Pre-filled                                                                                              |
| ------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **+** (Plan, Goals, Projects, Inbox, Upcoming, Journal, More) | Activity sheet (new task)          | date = selected date; start = next free slot after now (today) or 9:00 AM; 30 min; hue clay; icon check |
| Empty half-hour on timeline                                   | Activity sheet (new task)          | that start time                                                                                         |
| "Add task" in a gap                                           | Activity sheet (new task)          | gap start, gap-sized duration (15–60)                                                                   |
| **+** on Habits / Routines                                    | New habit / New routine sheet      | None                                                                                                    |
| All tasks **+ Task** chip, or **+** on All tasks              | Activity sheet (new task, Anytime) | today                                                                                                   |
| Inbox **Plan**                                                | Activity sheet (new task)          | title, notes from the item; saving removes the item from Inbox                                          |
| All tasks **Place**                                           | Activity sheet                     | suggested start; past dates move to today                                                               |
| Routine **Add to today**                                      | None (adds directly)               | next free slot that fits the full routine; then switches to Plan and pops the new capsule               |

"Next free slot" = round up to the next 15 minutes from the reference time, then skip past any activity it would collide with (snap to 5 minutes after it). The algorithm lives in `packages/domain/src/timeline/`.

## Focus

- **States:** setup, then run, then done. The timer keeps running while paused only in the sense of preserving the remaining time.
  - −5 / +5 adjust the remaining time and the total (minimum 30s remaining).
  - **End session** goes to done with the elapsed time.
- Production must survive tab switches and sleep (browsers throttle timers in background tabs): store `endsAt` (a timestamp), not a ticking counter. **Proposed:** a local notification at `endsAt`.

## Theme switching

- More → Appearance → Light / Dark switches instantly, with no reload.
- Production adds **System** and persists the choice. See [theming](../design/theming.md).

## Destructive actions

- Delete is an icon button in `danger` color, never the primary button.
- Prototype: immediate delete plus toast. Proposed: Undo in the toast (D5). Never add a confirm dialog for single-item deletes without approval.

## Copy style

- Sentence case everywhere ("Add to timeline", not "Add To Timeline"). Uppercase only via the `label` preset.
- Direct and warm, never cute: "Inbox zero", "A blank canvas", "Ready when you are".
- Times: `9:30 AM`, ranges `9:30–11:30 AM` (en dash). Durations: `45 min`, `1 hr 30 min`; compact `1h 30m` in tags and gaps.
- Dates: `Today`, `Tomorrow`, `Yesterday`, otherwise `Thu, Nov 19`.
