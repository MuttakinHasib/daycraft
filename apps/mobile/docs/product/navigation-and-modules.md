# Navigation and modules

Screen-by-screen reference for the phone app, taken from the prototype (canvas page “v2 · Refined”). Each screen has a screenshot at `docs/design/reference/screens/phone/{dark,light}/<name>.png` (index: [reference README](../design/reference/README.md)). Numbers are in points (pt = px on the 390-wide reference device). Shared measurements (page padding, card padding, component heights) live in [spacing-and-layout](../design/spacing-and-layout.md). This file only lists what is specific to each screen.

## Navigation model

- **Four tabs:** Inbox · Today · Calendar · Browse. Today is the default.
  - Inbox shows a count badge when it has items.
  - Browse stays highlighted for every screen opened from it (Upcoming, Tasks, Habits, Routines, Goals, Projects, Journal).
- **Floating + button:** to the right of the tab bar. It opens the task editor with the next free 15-minute slot after now (on today) or 9:00 AM (on other days) as the start time.
- **Sub-screens** of Browse show a **‹ Browse** back control (Projects detail shows **‹ Projects**).
- **Focus** is full-screen: the tab bar and + button are hidden. Close (×) returns to Today.
- **Sheets** (detail, editor, new habit, new routine, month picker) slide up over the current screen with a scrim. Tapping the scrim closes them.
- Whether the tabs are native or a custom floating bar is **open decision D1** ([status](../status-and-decisions.md#open-decisions)). The behavior above holds either way.

### Planned Expo Router layout

Proposed; create the files as the screens are built. Keep route files thin: they compose feature components and hooks.

```text
src/app/
  _layout.tsx                 # providers, theme, fonts, tab navigator
  (tabs)/
    _layout.tsx               # tab bar + floating “+”
    inbox.tsx
    index.tsx                 # Today
    calendar.tsx
    browse/
      _layout.tsx             # stack
      index.tsx               # Browse list
      upcoming.tsx
      tasks.tsx
      habits.tsx
      routines.tsx
      goals.tsx
      projects/index.tsx
      projects/[projectId].tsx
      journal.tsx
  focus/[activityId].tsx      # full-screen modal
  activity/[activityId].tsx   # detail sheet (formSheet/modal presentation)
  activity/edit.tsx           # editor sheet (new + edit via params)
  habit/new.tsx
  routine/new.tsx
  month-picker.tsx
```

Prefer Expo Router modal / form-sheet presentation for sheets so they get native gestures and back handling. Check the SDK 58 docs for the current presentation options before implementing.

## Screens

### Today

- **Header** (24 from top, 20 side padding):
  - Date title in the `date` type preset: “November 17,” in ink, the year in `accent-text`, then a › chevron. Tapping the title opens the month picker.
  - On the right: **Today** chip (only when another date is selected) and a 40pt daily progress ring showing a percentage.
- **Subline:** `body-sm` muted: “Tuesday · Today · 6 of 19 done”.
- **Week strip:**
  - Seven columns Sun–Sat with 22pt ‹ › week arrows at both ends.
  - Each column has a weekday label (`label` size, subtle), a 36pt date circle and up to four 7pt hue dots, one per distinct non-routine activity color that day.
  - The selected date's circle is filled with `accent` (text `on-accent`); today's number is shown in `accent-text`.
- **Timeline panel:**
  - `surface` background, top corners `radius-sheet` (30), top hairline and a 36×4 grabber.
  - Inside, the **habit row** sits on top: horizontally scrolling 44pt circles 56pt apart, each with an 11pt label below; the last one is “+ Habit”.
  - The **timeline** sits below. See [timeline-guide](timeline-guide.md).

### Inbox

- Title `display` “Inbox”, subtitle “Capture now, organize later.”
- **Capture field:**
  - 48pt pill on `surface` with a hairline border and a sparkle icon.
  - Placeholder “Capture a task or idea…”.
  - Circular 36pt accent add button. Enter also submits.
- **List:**
  - `label` “4 UNSORTED”, then cards (16 left / 12 right padding).
  - Each card has a 24pt ring (clears the item), the title in `activity`-weight 15, a meta line (note · age), and a **Plan** small chip in `accent-soft`.
- **Empty state:** illustration, “Inbox zero” in `heading`, one supporting sentence.

### Calendar

- **Header:**
  - ‹ title › where the title is “November 2026” (day view: “Tue, Nov 17”). It uses `heading` (20) so it fits on one line at 375pt.
  - An accent **+ Event** chip on the right.
- **Segmented control:** Day · Week · Month.
- **Month view:** weekday initials, then a 7-column grid of 50pt cells, each with a 30pt date circle and up to 3 hue dots (routines excluded). Days outside the month are dimmed to 38%. Below it: the agenda for the selected date.
- **Week view:**
  - 7 columns, 6 AM–midnight at 0.6 pt/min, with a 34pt hour gutter.
  - **Events** render as tinted blocks (30% hue mix on `surface`, solid hue border). **Tasks** render outlined (70% hue mix border on `surface`).
  - Includes a now line on today's column and an Events/Tasks legend.
- **Agenda rows:**
  - Time column (52pt), then a card with a 32pt hue icon circle, title, sub-line and a kind tag.
  - Events are tinted (16% hue background, 40% hue border, “Event” tag tinted). Tasks and routines use a `surface` card with a hairline.
  - Done items are struck through at 60% opacity.

### Browse

- Header: the Daybreak mark (15×32) and “Browse” in `display`.
- **Groups:**
  - **Plan:** Upcoming, Tasks (open count), Focus.
  - **Grow:** Habits (checked/total today), Routines (count), Goals (count).
  - **Organize:** Projects (count), Journal.
- Each row: 32pt hue tile with a white icon, label, right-aligned count, chevron.
- **Appearance:** segmented Light / Dark with a one-line explanation. The prototype has no “System” option; add one when theme persistence lands.

### Upcoming

- Next 14 days.
- Each day with content gets a heading (“Tomorrow”, then “Thu, Nov 19”) and a list.
- Each row: 4pt hue bar, title, time · location, and a kind tag.
- Unscheduled tasks due that day appear with a “Due” tag in `accent-soft`.
- Daily repeating routines and the generic “Deep work” block are filtered out to keep the list meaningful. Production: filter out repeating routine instances.

### Tasks

- Filter chips with counts: **Open · Today · Unscheduled · Done**.
- **Cards:**
  - Ring on the left; title (struck through when done).
  - A tag row: when (`clock` icon + “Today · 2:30 PM”, or `flag` + “Due Thu, Nov 19” for unscheduled), duration, priority (color: high `danger`, medium `amber`, low muted), subtask count, labels.
  - A **Place** chip appears on unscheduled tasks. It opens the editor with a suggested start time.
- **Empty state** per filter.

### Habits

- Summary line: “3 of 5 checked in today.” (adds “— a perfect day.” when all are done).
- **Card:**
  - 40pt hue circle icon, name, “Every day” or “4× a week”, then a flame icon with “13-day streak” (or “Start a streak” at 0).
  - A 44pt check button on the right: outlined in the hue, filled when checked in.
  - Below: a 7-day bar row with weekday letters.
- Weekly habits add “This week · 3 of 4”.
- Tapping the name expands a **5-week heatmap** (7 columns, 6pt-radius cells) and a completion %.

### Routines

- Expandable cards:
  - 40×56 capsule-shaped hue icon, name, “4 steps · 30 min”, chevron.
  - Expanded: the steps on a mini spine (dot · title · minutes) and an `md` primary button **Add to today** (or “Add to tomorrow” / the date).
- **New routine sheet:** name, steps list (numbered hue dots, remove ×), step composer (name + 5/10/15/20/30m chips + Add), color, icon, **Save routine**.

### Goals

- **Card:**
  - 56pt progress ring with a percentage, title, description.
  - “Target Sun, Dec 20, 2026 · 33 days left”.
  - Milestone checklist (20pt squares, `radius-check`); checked milestones are struck through.
  - Related tags.
- Checking a milestone shows the toast “Milestone reached · …”.

### Projects

- **List:**
  - Cards with a 40pt hue tile, name, “8 tasks · 5 left · due Sun, Dec 20” and a progress bar with %.
- **Detail:**
  - Back to Projects; header with tile + `title` (24) + due line; description; progress bar.
  - Milestone tags in a horizontal scroll.
  - Segmented **List / Board**.
  - **List** groups To do / In progress / Done with rings, plus an “Add a task to this project…” field.
  - **Board** has three 250pt columns on `sunken` with `surface` cards and a move chip (Start → / Done → / Reopen →).

### Journal

- Date line.
- **Card:**
  - “How are you feeling?” then five mood faces (44pt circles). The selected face is filled with its mood hue.
  - Prompt banner in `accent-soft` with a shuffle button.
  - Multiline text field; **Save entry** / **Update entry**.
- **Earlier:** history cards (mood circle, date, one-line excerpt). Tapping a card expands the full text.

### Focus

- Full-screen.
- **Header:** close × (40pt), a “FOCUS” label, and a card for the activity (hue capsule, time, title).
- **Setup:**
  - 250pt ring showing the time in the `clock` preset (56) with “Ready when you are”.
  - Length chips 15m / 25m / 45m / 60m / 90m.
  - **Start focus** button.
- **Running:**
  - The ring fills with the hue each second; the state reads “Focusing” or “Paused”.
  - Controls: −5 · play/pause (76pt accent circle) · +5. Below: **End session**.
- **Done:**
  - 96pt hue circle with a check, “Session complete” (`title`), and “You focused for X min Y s on …”.
  - Buttons: **Mark task as done** (only if not done yet) and **Another session**.

### Sheets

Specs in [spacing-and-layout](../design/spacing-and-layout.md#sheets). Behavior in [interaction-patterns](interaction-patterns.md).
