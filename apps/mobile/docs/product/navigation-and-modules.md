# Navigation and modules

Screen-by-screen reference for the phone app, taken from the prototype (canvas page "v2 · Current"). Each screen has a screenshot at `docs/design/reference/screens/phone/{dark,light}/<name>.png` (index: [reference README](../../../../docs/design/reference/README.md)). Numbers are in points (pt = px on the 390-wide reference device). Shared measurements (page padding, card padding, component heights) live in [spacing-and-layout](../design/spacing-and-layout.md). This file only lists what is specific to each screen.

## First launch

The animated splash, then [onboarding](onboarding.md) on the first run (Plan on every later launch). Onboarding ends on Plan.

## Navigation model

- **Tab bar: Plan · Habits · + · Goals · More.** Plan is the default. Two tabs sit on each side of a centered **+**, all inside one floating pill.
  - **Plan** is the timeline for the selected day. There is no separate Calendar or Tasks tab and no Day/Week/Month switch: scheduled tasks and events are on the timeline, the date title opens the month picker, and the week strip changes the day.
  - **Habits** and **Goals** are tab roots with no top segmented control.
  - **More** holds everything else, in three groups (see [More](#more)). It shows the Inbox count as a badge and stays highlighted for every screen opened from it.
- **+ (beside the tab pill, [ADR-0009](../../../../docs/adr/0009-tab-bar-plus-beside-the-pill.md)):** context-aware. Its action and `accessibilityLabel` follow the current screen:
  - on Plan, Projects, Inbox, Upcoming, Journal and More, **New task** (editor with the next free 15-minute slot after now on today, or 9:00 AM on other days);
  - on All tasks, **New task** with no time (Anytime);
  - on Habits, the **New habit** sheet;
  - on Goals, the **New goal** sheet;
  - on Routines, the **New routine** sheet.
- **Sub-screens** of More show a **‹ More** back control (Project detail shows **‹ Projects**).
- **Focus** is full-screen: the tab bar is hidden. Close (×) returns to Plan.
- **Sheets** (detail, editor, new habit, new goal, new routine, month picker) slide up over the current screen with a scrim. Tapping the scrim closes them.
- No screen has top tabs. Segmented controls appear only inside content (All tasks filters, Project List/Board, editor Task/Event).
- Implementation: a custom floating pill tab bar, decided in [ADR-0003](../../../../docs/adr/0003-custom-floating-pill-tab-bar.md) (D1).

### Planned Expo Router layout

Proposed; create the files as the screens are built. Keep route files thin: they compose feature components and hooks.

```text
src/app/
  _layout.tsx                 # providers, theme, fonts, root stack, animated splash
  onboarding.tsx              # first run: intro + setup steps (Habits joins later; see onboarding.md)
  (tabs)/
    _layout.tsx               # Plan · Habits · + · Goals · More
    index.tsx                 # Plan (timeline)
    habits.tsx
    goals.tsx
    more/
      _layout.tsx             # stack
      index.tsx               # More list
      inbox.tsx
      upcoming.tsx
      tasks.tsx               # All tasks
      routines.tsx
      projects/index.tsx
      projects/[projectId].tsx
      journal.tsx
  focus/[activityId].tsx      # full-screen modal
  activity/new.tsx            # activity sheet, creating (formSheet presentation)
  activity/[activityId].tsx   # activity sheet, opened editable; no separate edit route
  habit/new.tsx
  goal/new.tsx
  routine/new.tsx
  month-picker.tsx
```

The + is not a route. It is a button in the tab bar that reads the focused route and opens the matching sheet.

Prefer Expo Router modal / form-sheet presentation for sheets so they get native gestures and back handling. Check the SDK 58 docs for the current presentation options before implementing.

## Screens

### Plan

- **Header** (24 from top, 20 side padding):
  - Date title in the `date` type preset: "November 17," in ink, the year in `accent-text`, then a › chevron. Tapping the title opens the month picker.
  - On the right: **Today** chip (only when another date is selected) and a 44pt daily progress ring (4pt stroke on a `line-strong` track). It shows the number without a % sign in 13pt extrabold, a check in `accent-text` at 100%, and only the track at 0.
- **Subline:** `body-sm` muted: "Tuesday · Today · 6 of 19 done".
- **Week strip:**
  - Seven columns Sun–Sat with 22pt ‹ › week arrows at both ends; a horizontal swipe also moves a week.
  - Each column has a weekday label (`label` size, subtle), a 36pt date circle and up to four 7pt hue dots, one per distinct non-routine activity color that day.
  - The selected date's circle is filled with `accent` (text `on-accent`); today's number is shown in `accent-text`.
- **Timeline panel:**
  - `surface` background, top corners `radius-sheet` (30) and a top hairline. No grabber: the panel doesn't move.
  - Inside, the **habit row** sits on top: horizontally scrolling 44pt circles 56pt apart, each with an 11pt label below; the last one is "+ Habit".
  - The **timeline** sits below. See [timeline-guide](timeline-guide.md).

### Inbox

- Opened from More (‹ More back control).
- Title `display` "Inbox", subtitle "Capture now, organize later."
- **Capture field:**
  - 48pt pill on `surface` with a hairline border and a sparkle icon.
  - Placeholder "Capture a task or idea…".
  - Circular 36pt accent add button. Enter also submits.
- **List:**
  - `label` "4 UNSORTED", then cards (16 left / 12 right padding).
  - Each card has a 24pt ring (clears the item), the title in `activity`-weight 15, a meta line (note · age), and a **Plan** small chip in `accent-soft`.
- **Empty state:** illustration, "Inbox zero" in `heading`, one supporting sentence.

### More

- Header: "More" in `display`, no logo.
- **Groups:**
  - **Capture and plan ahead:** Inbox (count), Upcoming, All tasks ("N unscheduled").
  - **Build:** Routines (count), Projects (count).
  - **Focus and reflect:** Focus, Journal.
- Each row: 32pt hue tile with a white icon, label, right-aligned count, chevron.
- **Replay onboarding:** a plain row below the groups (see [onboarding](onboarding.md)).
- **Appearance:** segmented Light / Dark with a one-line explanation. The prototype has no "System" option; add one when theme persistence lands.

### Upcoming

- Opened from More.
- Next 14 days.
- Each day with content gets a heading ("Tomorrow", then "Thu, Nov 19") and a list.
- Each row: 4pt hue bar, title, time · location, and a kind tag.
- Unscheduled tasks due that day appear with a "Due" tag in `accent-soft`.
- Daily repeating routines and the generic "Deep work" block are filtered out to keep the list meaningful. Production: filter out repeating routine instances.

### All tasks

- Opened from More. Header has an accent **+ Task** chip; the + also adds an unscheduled task here.
- Filter chips with counts: **Open · Today · Unscheduled · Done**.
- **Cards:**
  - Ring on the left; title (struck through when done).
  - A tag row: when (`clock` icon + "Today · 2:30 PM", or `flag` + "Due Thu, Nov 19" for unscheduled), duration, priority (color: high `danger`, medium `amber`, low muted), subtask count, labels.
  - A **Place** chip appears on unscheduled tasks. It opens the editor with a suggested start time.
- **Empty state** per filter.

### Habits

- Tab root, no top switch. The + opens **New habit**; the empty state carries a New habit chip.
- Summary line: "3 of 5 checked in today." (adds "A perfect day." when all are done).
- **Card:**
  - 40pt hue circle icon, name, "Every day" or "4× a week", then a flame icon with "13-day streak" (or "Start a streak" at 0). The streak counts completed days, or completed weeks that met the Target; the current day or week never breaks it, and nothing before the habit existed counts.
  - A 44pt check button on the right: outlined in the hue, filled when checked in. It checks in today only; the bars are display-only.
  - Below: a 7-day bar row with weekday letters, the last seven days ending today.
- Weekly habits add a "This week" line split across the card: the label on the left, "3 of 4" on the right, with the true count past the Target.
- Tapping the name expands a **5-week heatmap** (7 columns, 6pt-radius cells) with "N% completion" (check-ins ÷ the days the habit existed in the window), and **Edit habit** and **Delete habit**. Delete asks first, keeps the check-ins, and the habit's circles on dates it existed stay, read-only.

### Routines

- Opened from More. Header has an accent **+ Routine** chip; the + opens the same sheet.
- Expandable cards:
  - 40×56 capsule-shaped hue icon, name, "4 steps · 30 min", chevron.
  - Expanded: the steps on a mini spine (dot · title · minutes) and an `md` primary button **Add to today** (or "Add to tomorrow" / the date).
- **New routine sheet:** name, steps list (numbered hue dots, remove ×), step composer (name + 5/10/15/20/30m chips + Add), color, icon, **Save routine**.

### Goals

- Tab root, no top switch. The + opens the **New goal** sheet; the empty state ("No goals yet.") carries a New goal chip.
- Subline: "Long-term direction, broken into milestones."
- **Card:** one per live goal, in the order created.
  - 56pt progress ring (4pt stroke) in the goal's hue with the percentage inside; a goal with no milestones shows 0%. There are no related chips in v1.
  - Title, then the description when there is one.
  - **Target date** line with a flag: "Target Sun, Dec 20, 2026 · 33 days left", or "· N days past" once the date has passed; a goal with no Target date shows no line.
  - Milestone checklist (20pt squares, `radius-check`); a checked milestone is filled and outlined in the goal's hue, its title struck through and dimmed.
- Tapping a milestone toggles it in place and never expands the card. Checking one toasts "Milestone reached · {title}"; unchecking toasts nothing, and the last milestone adds no extra toast.
- Tapping the ring, title or description expands **Edit goal** and **Delete goal**. Edit goal opens the shared New/Edit sheet pre-filled; Delete goal asks "Delete “{title}”? This can't be undone.", then soft-deletes the goal — it and its milestones stop listing, the rows are kept — and toasts "Deleted · {title}".
- **New goal / Edit goal sheet** (one sheet for both): title, optional description, a **Target date** row that opens the date sheet (Clear removes the date), a Colour row that opens the hue sub-sheet, and a milestone composer (a field and an Add button, a remove × on each row, no cap). Save is always enabled; a blank title toasts "Name your goal first" and does not save. New reads **Add goal** and toasts "Goal added"; Edit reads **Save** and toasts "Goal saved".

### Projects

- Opened from More.
- **List:**
  - Cards with a 40pt hue tile, name, "8 tasks · 5 left · due Sun, Dec 20" and a progress bar with %.
- **Detail:**
  - Back to Projects; header with tile + `title` (24) + due line; description; progress bar.
  - Milestone tags in a horizontal scroll.
  - Segmented **List / Board**.
  - **List** groups To do / In progress / Done with rings, plus an "Add a task to this project…" field.
  - **Board** has three 250pt columns on `sunken` with `surface` cards and a move chip (Start → / Done → / Reopen →).

### Journal

- Opened from More.
- Date line.
- **Card:**
  - "How are you feeling?" then five mood faces (44pt circles). The selected face is filled with its mood hue.
  - Prompt banner in `accent-soft` with a shuffle button.
  - Multiline text field; **Save entry** / **Update entry**.
- **Earlier:** history cards (mood circle, date, one-line excerpt). Tapping a card expands the full text.

### Focus

- Full-screen.
- **Header:** close × (40pt), a "FOCUS" label, and a card for the activity (hue capsule, time, title).
- **Setup:**
  - 250pt ring showing the time in the `clock` preset (56) with "Ready when you are".
  - Length chips 15m / 25m / 45m / 60m / 90m.
  - **Start focus** button.
- **Running:**
  - The ring fills with the hue each second; the state reads "Focusing" or "Paused".
  - Controls: −5 · play/pause (76pt accent circle) · +5. Below: **End session**.
- **Done:**
  - 96pt hue circle with a check, "Session complete" (`title`), and "You focused for X min Y s on …".
  - Buttons: **Mark task as done** (only if not done yet) and **Another session**.

### Sheets

Specs in [spacing-and-layout](../design/spacing-and-layout.md#sheets). Behavior in [interaction-patterns](interaction-patterns.md).
