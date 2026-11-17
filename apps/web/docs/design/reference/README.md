# Design reference

Exported from the Daycraft design canvas (page **v2 · Current**) so agents can see the design without canvas access. This is the visual source of truth for layout and behavior; token **values** live in [daycraft-tailwind-v1.1.css](daycraft-tailwind-v1.1.css) (see [status-and-decisions](../../status-and-decisions.md) for how they relate to the code).

All screens use the prototype's fixed sample data and clock: **Tue, Nov 17, 2026, 10:40 AM**. Screens were rendered with the bundled runtime in `prototype/vendor/` and checked against the canvas.

## Contents

| Path | What |
|---|---|
| `screens/desktop/today-1440-dark.png`, `today-1440-light.png` | Desktop Today at 1440 (full page) |
| `screens/desktop/today-768-dark.png` | Tablet 768: icon rail, details panel stacked under the timeline |
| `screens/desktop/today-1920-light.png` | Large desktop 1920: content capped at 1360 |
| `screens/phone/dark/*.png`, `screens/phone/light/*.png` | Phone screens: the content/behavior reference for modules without a desktop design yet (decision W5) |
| `design-system-v1.1.png` | Design system board: tokens, type scale, component sizes, components in both themes, refinement log |
| `brand/logo-concepts.png`, `brand/logo-system.png` | Logo exploration and the chosen Daybreak logo system |
| `prototype/*.html` | **Runnable prototype.** Open in a browser (works offline). Click through screens; the logic in each file's `<script>` is the reference implementation of behavior such as the timeline layout and drag/resize |
| `daycraft-tailwind-v1.1.css` | Design system v1.1 tokens (web Tailwind v4 format) |

## Phone screens

`screens/phone/{dark,light}/<name>.png`

| Name | Shows |
|---|---|
| `plan` | Plan tab: date header, week strip, progress ring, habit row, timeline (active block at 10:40, done blocks, free-time hints), tab bar with center + |
| `habits` | Habits tab: streaks, 7-day bars, expanded 5-week heatmap (Read) |
| `goals` | Goals tab: progress ring, target date, milestones, related tags |
| `more` | More tab: Inbox, Upcoming, All tasks / Routines, Projects / Focus, Journal / Appearance |
| `inbox` | More → Inbox: capture field, unsorted items with Plan chips |
| `upcoming` | More → Upcoming: next 14 days, due-but-unscheduled tasks |
| `all-tasks` | More → All tasks: Open / Today / Unscheduled / Done filters, task cards, Place chip |
| `routines` | More → Routines: expanded routine with steps and “Add to today” |
| `projects` | More → Projects: list with progress bars |
| `project-list` | Project detail, List view |
| `project-board` | Project detail, Board (kanban) view |
| `journal` | More → Journal: mood, prompt, entry, history |
| `sheet-detail` | Activity detail sheet (hue header, info rows, subtasks, Start focus) |
| `sheet-new-task` | Editor sheet, new task (center + on Plan) |
| `sheet-new-event` | Editor sheet switched to Event |
| `sheet-new-habit` | New habit sheet (center + on Habits) |
| `sheet-new-routine` | New routine sheet |
| `sheet-month-picker` | Month picker sheet (tap the date title) |
| `focus-setup` | Focus: setup (length chips) |
| `focus-running` | Focus: running (ring, −5 / pause / +5, End session) |
| `focus-done` | Focus: session complete |

## Desktop screens

| File | Shows |
|---|---|
| `screens/desktop/today-1440-dark.png` | Sidebar (Plan, Habits, Goals, then the More group), header with week strip, habit chips, timeline with the selected (active) block, detail panel, daily progress, up next, inbox |
| `screens/desktop/today-1440-light.png` | Same in light |
| `screens/desktop/today-768-dark.png` | Rail mode (≤ 1100 container) |
| `screens/desktop/today-1920-light.png` | 1920: centered 1360 content |

## Prototype files

| File | What |
|---|---|
| `prototype/phone-dark.html` | iPhone app, dark (390×844 frame) |
| `prototype/phone-light.html` | iPhone app, light |
| `prototype/desktop-dark.html` | Desktop Today, dark (resize the window to see rail mode at ≤ 1100) |
| `prototype/desktop-light.html` | Desktop Today, light |
| `prototype/design-system.html` | Design system board |

The prototype is a reference, not production code:
- Do not copy its structure: it is a single-file prototype with inline styles and `dk-*` classes. Implement with this repo's components and tokens.
- Do copy its **behavior and numbers** where the docs point to it (timeline layout, snapping, gap rules, copy).
- `vendor/dc-mini-runtime.js` is a tiny renderer for the canvas file format (template holes, `sc-if`, `sc-for`), included only so the files run offline.

## Updating

When the design canvas changes, re-export the affected screens and prototype files here in the same change as the code or doc update, and keep file names stable so links keep working.
