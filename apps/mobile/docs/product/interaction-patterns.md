# Interaction patterns

> Has a web counterpart in `apps/web/docs/product/`. Keep both in step except for platform notes.

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
- On screen readers it is a polite live announcement (`accessibilityLiveRegion="polite"` / `AccessibilityInfo.announceForAccessibility`).

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
      - Alert: "1 alert" · "At start" → the **Alert sheet**. Hidden until notifications exist: a setting that never fires would mislead.
    - **Pills** (48pt, `card`): Repeat (Never / Every day / Weekdays / Every week), Priority (tasks), Colour (hue and icon). Events show Location instead of Priority. Each opens its own small sheet. Until repeating activities are built, Repeat shows its value and does not open. Labels are not in the sheet; labels already saved on an activity are kept.
    - **Subtasks and notes card:** tickable subtasks, an "Add subtask" field (Return adds the next), a hairline, then the notes field.
    - **Delete task / Delete event:** a full-width `card` button with `danger` text, existing activities only.
    - **⋯ menu:** Start focus (tasks), Duplicate, Move to Inbox (tasks), a separator, Delete (`danger`). Start focus and Move to Inbox appear once Focus and Inbox exist.
    - **Duplicate** opens a new activity sheet filled in with a copy: same title, kind, colour, icon, length, notes and subtasks (unticked), starting when the original ends. Nothing is saved until **Add to timeline**.
  - **Saving:**
    - **Save changes** is hidden while the sheet matches what is saved. The first change (title, date, time, alert, repeat, priority, colour, notes, adding or renaming subtasks) slides it up from the bottom (`sheet-up`), pinned 30pt above the safe area. Saving writes, toasts `Saved · Today, 9:30 AM` and closes the sheet. While the keyboard is up, Save steps aside (it would cover the field being typed in) and slides back when the keyboard goes down; dragging the content down closes the keyboard.
    - **Instant actions don't wait for Save:** the check ring and subtask ticks save at once with their usual toast, as on the timeline.
    - **New activities** show the primary button from the start, reading **Add to timeline** (scheduled task), **Add task** (Anytime) or **Add event**, disabled until the title is not blank.
    - **Closing:** a clean sheet closes on × or swipe down. A sheet with unsaved changes blocks the swipe and shows an action sheet: "You have unsaved changes." · **Discard changes** (`danger`) · **Keep editing**.
    - **Delete** asks first: "Delete “{title}”? This can’t be undone." · **Delete task** · **Cancel**.
  - **Date sheet:** Plan's month picker: month title (tap for the year's months), **Today** and × joined in one glass group; a Sunday-to-Saturday grid with activity dots; the selected day is an `accent` circle, today is `accent` text. It is the same picker as Plan's month picker. Picking a day sets it and closes the sheet.
  - **Time sheet:** a **Starts** wheel (hour, minute in 5-minute steps, AM/PM) and a **Duration** wheel (hours 0–12, minutes in 5-minute steps), both on `card` with the selection band in `raised`; fixed preset chips 15m 30m 45m 1h 1h 30m 2h; **Done**. Tasks also get the Timeline / Anytime switch here when Anytime is available.
  - **Alert sheet:** None / At start / 5 min before / 15 min before / 1 hr before (one alert for now); picking one closes the sheet.
  - **New habit / New routine / Month picker:** plain header (title in `heading` + close).
### Activity sheet, Structured-style controls (decided 2026-11-19)

These follow the person's reference app and replace the matching parts above where they differ.

- **Small sheets float:** Date, Time, Repeat, Priority, Location and Colour & Icon open as cards inset from the screen edges with all four corners rounded, stacked over the activity sheet; × closes; choices apply at once.
- **Segmented control:** a dark `sunken` track with the selected option as an `accent` pill in `on-accent` text (Task / Event, Repeat, Duration).
- **Date sheet:** tapping the month title switches the day grid to a native month and year wheel (title chevron turns to ⌄; tap again for the days). Today and × stay.
- **Repeat sheet:** "Repeat" with ×, a segmented **Once · Daily · Weekly · Monthly**. The choice is stored now; occurrences come with repeating activities (onboarding ticket 01). No Pro panel. A stored "Weekdays" still shows as Weekdays.
- **Subtasks:** typing the first letter in "Add subtask" turns that row into a subtask (with ×) and a new empty "Add subtask" row appears below; Return moves to it; an empty Return closes the keyboard. The header shows a done/total counter under the title once there are subtasks.
- **Labels:** small "Subtasks" and "Notes" labels (`label` preset, `ink-subtle`) above each part of that card.
- **Button:** a full-width `accent` pill reading **Update task** / **Update event** (was Save changes); still hidden until something changes, steps aside while the keyboard is up, and closes the sheet.
- **Colour & Icon sheet:** a row of colour circles (selected ringed), ⋯ for a custom colour, a "Suggestions" chip with icons matched to the title, a bar of icon categories, a search field and the icon grid.
- **Custom colour ("Choose a colour"):** a hue slider, a shade slider, a hex field, a preview capsule, and presets: the nine named colours plus the three most recent custom colours (no Edit). A custom colour is stored as a hex code in the same field as a named colour, looks the same in both themes, and works everywhere a named colour does. Icons and text on a light colour switch from `on-hue` to `ink` when white would fall below 3:1.

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
- Production must survive backgrounding: store `endsAt` (a timestamp), not a ticking counter. **Proposed:** a local notification at `endsAt`.

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
