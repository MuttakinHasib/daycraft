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

| Action | Toast |
|---|---|
| Complete / uncomplete | `Done · {title}` / `Marked as not done` |
| Create | `Task added · Today, 10:45 AM` · `Event added · Thu, Nov 19, 3:00 PM` |
| Edit | `Saved · Today, 2:30 PM` |
| Move / resize | `Moved to 11:15 AM–12:15 PM` · `Now 1 hr 15 min · ends 12:45 PM` |
| Delete | `Deleted · {title}` (Proposed: with **Undo**, see D5) |
| Habit | `{name} · checked in` / `{name} · unchecked` |
| Routine added | `{routine} added · 7:30–8:15 PM` |
| Capture | `Captured to Inbox` |
| Validation | `Give it a name first` · `Name your habit first` · `Add at least one step` |
| Theme | `Light appearance` / `Dark appearance` |

Toast behavior:

- One toast at a time; a new one replaces the current one.
- Auto-dismiss after 2.4s.
- Positioned above the tab bar.
- On screen readers it is a polite live announcement (`accessibilityLiveRegion="polite"` / `AccessibilityInfo.announceForAccessibility`).

## Sheets

- Every create, edit and detail flow opens in a **bottom sheet**. Full-screen screens are reserved for Focus.
- **Opening:** the sheet slides up (`sheet-up`: 48pt, 340ms, `ease-snap`) and the scrim fades in.
- **Closing:** tap the scrim or × (top-left), or swipe down (native sheet).
- **Sheet types:**
  - **Detail sheet:** colored header band in the activity hue. Shows kind, date/time rows, subtasks (tickable in place) and notes. Actions: delete (icon button), **Start focus** (tasks and routines), or **Edit event** (events). The pencil (top-right) opens the editor.
  - **Editor sheet** (create and edit share one component):
    - Header band in the selected hue: Task/Event segmented control, icon, and the title input (white text, underline).
    - **Body:**
      - date row with ‹ › day stepping;
      - Time: for tasks, a segmented control **Timeline / Anytime**; a stepper −15 / range / +15;
      - Duration segments 15m 30m 45m 1h 1.5h 2h;
      - Color (9 hues); Icon (18-icon grid);
      - tasks only: Priority (None/Low/Medium/High), Labels (multi-select chips), Subtasks (list + add);
      - events only: Location;
      - Repeat (Never/Daily/Weekdays/Weekly); Notes.
    - Footer: delete (edit mode only) and the primary button, which reads **Add to timeline** (scheduled task), **Add task** (Anytime), **Add event**, or **Save changes**.
  - **New habit / New routine / Month picker:** plain header (title in `heading` + close).
- Switching the editor from Anytime to Timeline restores the last start time. An event can never be unscheduled.

## Completing things

- Check rings toggle (`checkbox` role). Completing an activity **also completes all its subtasks**. Uncompleting leaves subtasks as they are.
- Subtasks toggle individually in the detail sheet.
- Habits toggle per date. Future dates are blocked (see the habit toast in [timeline-guide](timeline-guide.md#12-date-navigation)).
- Done items: struck through, muted, and kept in place (not hidden) on the timeline. Tasks' Done filter lists them.

## Creating

| Entry point | Opens | Pre-filled |
|---|---|---|
| Center **+** (Plan, Goals, Projects, Inbox, Upcoming, Journal, More) | Editor (task) | date = selected date; start = next free slot after now (today) or 9:00 AM; 30 min; hue clay; icon check |
| Empty half-hour on timeline | Editor (task) | that start time |
| "Add task" in a gap | Editor (task) | gap start, gap-sized duration (15–60) |
| Center **+** on Habits / Routines | New habit / New routine sheet | None |
| All tasks **+ Task** chip, or center **+** on All tasks | Editor (task, Anytime) | today |
| Inbox **Plan** | Editor (task) | title, notes from the item; saving removes the item from Inbox |
| All tasks **Place** | Editor (edit) | suggested start; past dates move to today |
| Routine **Add to today** | None (adds directly) | next free slot that fits the full routine; then switches to Plan and pops the new capsule |

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
