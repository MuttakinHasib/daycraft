# Product overview

> Has a web counterpart in `apps/web/docs/product/`. Keep both in step except for platform notes.

## What Daycraft is

Daycraft is a personal productivity and life planner. People use it to shape their day intentionally: see the whole day at a glance, place responsibilities and commitments on it, keep habits and routines going, and make visible progress on goals and projects.

It should feel like a **personal life-management workspace**, not a task manager with a calendar bolted on. The visual and interaction language comes from the timeline-first reference app the founder liked (calm, vertical day timeline, pill-shaped activity blocks, floating navigation). Daycraft keeps that familiarity and adds its own identity: a white canvas with light-gray cards, saturated activity colors with white icons, a blue accent, Onest, and the Sunrise Pen logo (a fountain pen drawing the horizon under a rising sun). See [ADR-0008](../../../../docs/adr/0008-visual-direction-clean.md).

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
| **Plan** | Date header (title opens the month picker), week strip, daily progress ring, habit check-in row, the timeline. Scheduled tasks and events both live here | Plan (tab) |
| **Habits** | Daily or N×/week habits, streaks, 7-day row, 5-week history heatmap | Habits (tab) |
| **Goals** | Target date, progress from milestones, related habits/tasks | Goals (tab) |
| **Inbox** | Quick capture; each item can be planned onto the timeline or cleared | More → Inbox |
| **Upcoming** | Chronological next 14 days of scheduled items, plus due-but-unscheduled tasks | More → Upcoming |
| **All tasks** | Every task with filters Open / Today / Unscheduled / Done; place unscheduled tasks on the timeline | More → All tasks |
| **Routines** | Reusable step sequences; "Add to today" drops one onto the timeline as a single block with steps as subtasks | More → Routines |
| **Projects** | Progress, deadline, milestones, tasks in List or Board (To do / In progress / Done) | More → Projects |
| **Focus** | Timer for one activity: choose 15/25/45/60/90 min, pause/resume, ±5 min, end, complete the task | From an activity's detail sheet, or More → Focus |
| **Journal** | Mood (5 levels), rotating reflection prompt, free text, history | More → Journal |
| **Settings / Appearance** | System / Light / Dark (System by default; saved per device) | More → Appearance |

There is no separate Calendar module: the Plan timeline is the day view, the month picker covers month navigation, and Upcoming covers the days ahead.

Navigation and screen specs: [navigation-and-modules.md](navigation-and-modules.md).

## Key user workflows

These are the flows every release must keep working. They are the end-to-end test candidates in [testing](../development/testing.md).

1. **See today.** Open the app. Plan scrolls so the current time sits about a third of the way down, and the current block shows its progress and time left.
2. **Move between dates.** Tap a day in the week strip, use the ‹ › week arrows, tap the date title to open the month picker, tap the **Today** chip to return.
3. **Create a task.** Tap the center **+** (or an empty half-hour on the timeline, or "Add task" in a free-time gap) to open the editor sheet. Set the title, time, duration, color, icon, priority, labels, subtasks, repeat and notes, then tap **Add to timeline**.
4. **Edit a task.** Tap a block to open its detail sheet, tap the pencil, change what you need, then tap **Save changes**.
5. **Complete.** Tap the check ring on a block, in the detail sheet, or in All tasks.
6. **Reschedule.** Drag a block vertically (5-minute snapping). **Resize:** drag its bottom grip.
7. **Create an event.** Tap **+** (or an empty slot), then switch the editor's Task/Event toggle to Event.
8. **Habits.** Tap a habit circle on Plan, or the check button in Habits. Add a habit from the "+ Habit" circle on Plan or the + on Habits.
9. **Routines.** Create one (name, steps with durations, color, icon). **Add to today** places it at the next free slot.
10. **Focus.** In an activity's detail sheet, tap Start focus, choose a length, run the session and end it, then tap "Mark task as done".
11. **Capture and plan.** Type in Inbox and the item appears. **Plan** opens the editor pre-filled, and saving removes the item from Inbox.
12. **Theme.** More → Appearance → Light / Dark.

Every one of these gives visible feedback (toast, state change, or animation). See [interaction-patterns](interaction-patterns.md).

## Vocabulary

Use these exact terms in code, UI copy, issues and tests. The vocabulary lives in the monorepo root [`GLOSSARY.md`](../../../../GLOSSARY.md), which is the canonical reference (see the root [`docs/agents/domain.md`](../../../../docs/agents/domain.md) for the rules).

## Domain model (from the prototype)

The prototype's in-memory model is the starting point for `packages/domain/src/`. Field names below are the recommended production names. The prototype's short names are in brackets.

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
  durationMinutes: number;      // [dur] 0 = point in time (e.g. "Rise and shine")
  title: string;
  hue: ActivityHue;             // from @daycraft/domain
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
