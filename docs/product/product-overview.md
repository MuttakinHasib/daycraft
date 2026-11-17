# Product overview

> Shared with the web repo (`web.daycraft.com`). Keep both copies identical except for platform notes.

## What Daycraft is

Daycraft is a personal productivity and life planner. People use it to shape their day intentionally: see the whole day at a glance, place responsibilities and commitments on it, keep habits and routines going, and make visible progress on goals and projects.

It should feel like a **personal life-management workspace**, not a task manager with a calendar bolted on. The visual and interaction language comes from the timeline-first reference app the founder liked (calm, vertical day timeline, pill-shaped activity blocks, floating navigation). Daycraft keeps that familiarity and adds its own identity: terracotta brand, warm neutrals, Plus Jakarta Sans, and the Daybreak logo (a capsule with a sunrise cut through it).

## Product philosophy

- **The timeline is the product.** Today's timeline is the home screen and the strongest, most refined surface. Every other module exists to feed it or to reflect on it.
- **Do not overwhelm.** Few, well-made modules. No dashboards of widgets. One accent color. Color is reserved for the user's own activities.
- **Each concept has one job:**
  - **Task**: a responsibility.
  - **Event**: a commitment at a fixed time.
  - **Habit**: a recurring behavior you check in on.
  - **Routine**: a reusable sequence of steps.
  - **Goal**: long-term direction made of milestones.
  - **Project**: related work.
  - **Journal**: reflection.
  - **Inbox**: unsorted capture.
- **Calm and precise.** Readable at a glance, exact when you need it (5-minute snapping, real durations, current-time indicator).

## Modules

| Module | Purpose | Prototype screen |
|---|---|---|
| **Today** | Date header, week strip, daily progress ring, habit check-in row, the timeline | Today (tab) |
| **Inbox** | Quick capture; each item can be planned onto the timeline or cleared | Inbox (tab) |
| **Calendar** | Day / Week / Month views; events vs tasks distinguished; create events | Calendar (tab) |
| **Upcoming** | Chronological next 14 days of scheduled items, plus due-but-unscheduled tasks | Browse → Upcoming |
| **Tasks** | All open tasks with filters Open / Today / Unscheduled / Done; place unscheduled tasks on the timeline | Browse → Tasks |
| **Habits** | Daily or N×/week habits, streaks, 7-day row, 5-week history heatmap | Browse → Habits |
| **Routines** | Reusable step sequences; “Add to today” drops one onto the timeline as a single block with steps as subtasks | Browse → Routines |
| **Goals** | Target date, progress from milestones, related habits/tasks | Browse → Goals |
| **Projects** | Progress, deadline, milestones, tasks in List or Board (To do / In progress / Done) | Browse → Projects |
| **Focus** | Timer for one activity: choose 15/25/45/60/90 min, pause/resume, ±5 min, end, complete the task | From an activity's detail sheet, or Browse → Focus |
| **Journal** | Mood (5 levels), rotating reflection prompt, free text, history | Browse → Journal |
| **Settings / Appearance** | Light / Dark (System to be added) | Browse → Appearance |

Navigation and screen specs: [navigation-and-modules.md](navigation-and-modules.md).

## Key user workflows

These are the flows every release must keep working. They are the end-to-end test candidates in [testing](../development/testing.md).

1. **See today:** open the app → Today scrolled so the current time is near the top third → current block shows progress and time left.
2. **Move between dates:** tap a day in the week strip, use the ‹ › week arrows, tap the date title to open the month picker, tap **Today** to return.
3. **Create a task:** tap **+** (or an empty half-hour on the timeline, or “Add task” in a free-time gap) → editor sheet → title, time, duration, color, icon, priority, labels, subtasks, repeat, notes → **Add to timeline**.
4. **Edit a task:** tap a block → detail sheet → edit (pencil) → **Save changes**.
5. **Complete:** tap the check ring on a block, in the detail sheet, or in Tasks.
6. **Reschedule:** drag a block vertically (5-minute snapping). **Resize:** drag its bottom grip.
7. **Create an event:** Calendar → **+ Event**, or switch the editor's Task/Event toggle.
8. **Habits:** tap a habit circle on Today, or the check button in Habits. Add a habit from either place.
9. **Routines:** create one (name, steps with durations, color, icon). **Add to today** places it at the next free slot.
10. **Focus:** from an activity's detail → Start focus → choose a length → run → end → “Mark task as done”.
11. **Capture and plan:** type in Inbox → item appears → **Plan** opens the editor pre-filled; saving removes it from Inbox.
12. **Theme:** Browse → Appearance → Light / Dark.

Every one of these gives visible feedback (toast, state change, or animation). See [interaction-patterns](interaction-patterns.md).

## Vocabulary

Use these exact terms in code, UI copy, issues and tests. The vocabulary lives in the root [`GLOSSARY.md`](../../GLOSSARY.md), which is the canonical reference (see `docs/agents/domain.md` for the rules).

## Domain model (from the prototype)

The prototype's in-memory model is the starting point for `src/domain/`. Field names below are the recommended production names. The prototype's short names are in brackets.

```ts
type ISODate = string;          // 'YYYY-MM-DD', the user's local calendar date
type MinutesOfDay = number;     // 0–1439, local wall-clock minutes from midnight

type ActivityKind = 'task' | 'event' | 'routine';
type Repeat = 'never' | 'daily' | 'weekdays' | 'weekly';
type Priority = 'none' | 'low' | 'medium' | 'high';

interface Activity {
  id: string;
  date: ISODate;
  start: MinutesOfDay | null;   // null = unscheduled (tasks only)
  durationMinutes: number;      // [dur] 0 = point in time (e.g. “Rise and shine”)
  title: string;
  hue: ActivityHue;             // see src/components/ui/hues.ts
  icon: IconName;
  kind: ActivityKind;
  done: boolean;
  notes: string;
  subtasks: { id: string; title: string; done: boolean }[]; // [subs: {t}]
  repeat: Repeat;
  priority: Priority;           // tasks only in UI
  labels: string[];             // Work, Personal, Health, Errand, Learning
  location: string;             // events
  projectId: string | null;     // [project]
}

interface Habit {
  id: string; name: string; icon: IconName; hue: ActivityHue;
  frequency: 'daily' | 'weekly';
  weeklyTarget: number;         // [target] 2–6 when weekly, 0 when daily
  checkIns: Record<ISODate, boolean>; // [hist]
}

interface Routine { id: string; name: string; icon: IconName; hue: ActivityHue;
  steps: { title: string; minutes: number }[] }                       // [steps: {t, d}]
interface Goal { id: string; title: string; description: string; targetDate: ISODate;
  hue: ActivityHue; milestones: { title: string; done: boolean }[]; related: { icon: IconName; title: string }[] }
interface Project { id: string; name: string; icon: IconName; hue: ActivityHue; deadline: ISODate; description: string;
  milestones: { title: string; date: ISODate; done: boolean }[];
  tasks: { id: string; title: string; status: 'todo' | 'doing' | 'done'; due: ISODate }[] }
interface JournalEntry { date: ISODate; mood: 1 | 2 | 3 | 4 | 5; text: string }
interface InboxItem { id: string; title: string; note: string; createdAt: string }
```

Derived values are computed and never stored:

- Habit streaks.
- Weekly habit counts.
- Goal progress (completed milestones ÷ total).
- Project progress (done tasks ÷ total).
- Daily progress (completed activities + checked-in habits ÷ total for the date).

Mood labels and hues:

| Mood | Hue |
|---|---|
| 1 Rough | rose |
| 2 Low | amber |
| 3 Okay | slate |
| 4 Good | sage |
| 5 Great | pine |
