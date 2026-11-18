# Navigation and modules (web)

Desktop and tablet reference, taken from the prototype boards "v2 · Desktop 1440", "v2 · Tablet 768" and "v2 · Large desktop 1920 · light". Screenshots: `docs/design/reference/screens/desktop/` and `screens/phone/` (index: [reference README](../../../../docs/design/reference/README.md)). Only **Today** has a desktop design. For the other modules, the phone screens (documented in `apps/mobile/docs/product/navigation-and-modules.md` and on the canvas boards "v2 · iPhone …") define content and behavior, and decision W5 ([status](../status-and-decisions.md#open-decisions)) defines how they adapt.

Shared measurements are in [spacing-and-layout](../design/spacing-and-layout.md).

## App shell

```text
┌──────────── sidebar 248 ────────────┬───────────────────────── main (padding 24 / 32 / 32) ─────────────────────────┐
│ ▮ daycraft                          │  ┌──────────────── content (max 1360, centered) ───────────────────────────┐ │
│ [ + New task ]                      │  │ November 17, 2026            ‹  Sun Mon [Tue] Wed Thu Fri Sat  ›        │ │
│ ▸ Plan (active)                     │  │ Tuesday · Today · drag to reschedule…                                    │ │
│   Habits 3/5 · Goals 3              │  │ ┌──────── timeline panel (flex) ───────────┐  ┌─ aside 340–420 ───────┐ │ │
│ MORE                                │  │ │ HABITS  (chips)                          │  │ detail panel          │ │ │
│   Inbox 4 · Upcoming · All tasks    │  │ │ timeline (scroll, height 700)            │  │ daily progress        │ │ │
│   Routines 4 · Projects 3 · Journal │  │ └──────────────────────────────────────────┘  │ up next · inbox       │ │ │
│ [ Light | Dark ]                    │  │                                                └───────────────────────┘ │ │
│ (H) Hasib · Personal workspace      │  └──────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────┘
```

**Sidebar:**

- 248 wide, `bg-surface`, right hairline, padding 24/16.
- Logo: Sunrise Pen mark 38×32 + wordmark 24 tall.
- **+ New task**: 44 tall, pill, accent. It creates a task at the next free slot and selects it.
- Nav items: 40 tall, radius 12, 18pt icon, 14 semibold label, right-aligned count.
  - Active: `bg-accent-soft` + `text-accent-text`.
  - Hover: `bg-sunken` + `text-ink`.
- Items mirror the phone tab bar, then its More screen: **Plan, Habits, Goals**, then a "MORE" group label (`label` preset) with **Inbox, Upcoming, All tasks, Routines, Projects, Journal**. There is no Calendar item. Focus starts from an activity's detail panel.
- Bottom: Light/Dark segmented control, then the user row (32 avatar, name, "Personal workspace").

**Rail mode** (container ≤ 1100, tablet): the sidebar becomes 80 wide.

- Icons only: labels, counts, group labels and the wordmark are hidden; the + button is a 48 circle.
- The theme control stacks vertically.
- Every icon-only item keeps its `aria-label`.

**Main:**

- Padding 24/32/32 (24 all round in rail mode).
- Inner content: max 1360, centered.
- Gap 24 between the header and the content row.

### Routes (proposed)

Create them as screens are built. Keep `page.tsx` files thin.

```text
src/app/
  layout.tsx                 # html/body, fonts, theme class, Toast provider
  (app)/
    layout.tsx               # sidebar + main shell
    page.tsx                 # Plan (default, ?date=YYYY-MM-DD)
    habits/page.tsx
    goals/page.tsx
    inbox/page.tsx
    upcoming/page.tsx
    tasks/page.tsx           # All tasks
    routines/page.tsx
    projects/page.tsx
    projects/[projectId]/page.tsx   # ?view=list|board
    journal/page.tsx
    focus/[activityId]/page.tsx
```

- **URL state:** the selected date, the selected activity (`?activity=id`, which drives the right panel) and project view all live in the URL. Back/forward and shared links must restore them.
- Use `<Link>` for navigation. Partial prefetching is on, so static parts prefetch automatically; add `prefetch` only where a measured need exists.

## Today (desktop)

**Header:**

- Date title in `display` (30): month + day in `ink`, the year in `accent-text`.
- Subline `body-sm` muted: "Tuesday · Today · drag to reschedule, pull the grip to resize, click an empty hour to plan".
- Right side:
  - **Today** chip (when another date is selected), then ‹ (40 icon button).
  - The **week strip**: a `bg-card` pill container with padding 4, holding seven 52×56 day buttons (radius 20). Each button shows the weekday in `micro`, the date at `activity` size in semibold, and hue dots. The selected day is filled `accent` with `on-accent` text and dots.
  - Then › (40 icon button).

**Timeline panel:**

- `bg-surface`, hairline, radius 24, flex 999 1 460.
- **Habits row** (12/20 padding, bottom hairline):
  - A `label` "HABITS", then pill chips (36 tall, 6 left padding, dashed `line-strong` border).
  - Each chip has a 26 hue circle with an icon (a check when done) and the name.
  - Done: tinted 16% hue background, no border.
- **Timeline scroll area:** height 700. See [timeline-guide](timeline-guide.md) (desktop values).

**Right panel (aside):**

- flex 1 1 340, max 420.
- **Detail card** (when an activity is selected): replaces the phone detail sheet.
  - Hue header band: kind tag ("Task · Today"), close ×, a 48×64 capsule icon, the time, and an **editable title input**.
  - Body:
    - Duration segmented 15m–2h;
    - Color swatches (28);
    - subtasks list (tick in place);
    - notes box;
    - inline **focus timer** (a 30pt clock with pause/resume and end, on `accent-soft`);
    - footer: delete icon button (44), **Complete/Undo** (secondary md), **Focus** (primary md).
- **Daily progress:** 72 ring, "Daily progress", "6 of 19 activities and habits done · 9h 5m planned".
- **Up next:** up to 4 upcoming activities (32 hue circle, title, time range). Clicking one selects it.
- **Inbox:** a 40 pill capture field with a 32 add button, then up to 4 items, each with a **Plan** chip. Plan removes the item from Inbox, creates the task at the next free slot and selects it.

**Tablet (≤ 1100 container):** the aside wraps below the timeline at full width (no max-width). The timeline keeps its 700 height.

## Other modules on desktop (until designed: decision W5)

Use the phone content and behavior with these adaptations:

- Lists and cards sit in the main column (max 1360), in a single column up to ~720 wide or a 2-column grid of cards when items are peers (goals, projects, habits).
- Phone **sheets** become:
  - the **right panel** when the flow starts from a selected item (detail, edit);
  - a **centered dialog** (radius 24, `bg-surface`, `shadow-float`, scrim) for create flows (new habit, new routine, new event).
- **Calendar:** month and week views get the full main width; the week view uses the desktop time scale and the same event/task styling rules as on phone.
- **Focus** stays full-screen (no sidebar), centered, with the same ring and controls.
