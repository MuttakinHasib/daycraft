# Daycraft

Daycraft is a calm personal planner whose center is the **Plan timeline**: a vertical day made of colored capsules on a spine. Tasks, events, habits, routines, goals, projects, focus and journal all feed the timeline rather than competing with it.

> One copy for the whole monorepo: `apps/mobile`, `apps/web` and future apps and packages all use these terms. How to use this vocabulary: [docs/agents/domain.md](docs/agents/domain.md).

## Language

### The timeline

**Plan**:
The main tab and module: the timeline for the selected date, with its week strip, progress ring and habit row.
_Avoid_: Today (for the screen), Calendar, day view

**Timeline**:
The vertical, time-proportional day of capsules on a spine, shown in Plan.

**Today**:
The current calendar date only, as in the Today chip, the Today filter and "Add to today".
_Avoid_: using it as the name of the Plan screen

**Activity**:
Anything placed on a day: a task, an event, or a routine instance.
_Avoid_: item, entry, block (in code)

**Capsule**:
The pill-shaped visual an activity takes on the timeline.
_Avoid_: bubble, card

**Spine**:
The vertical line connecting the day's capsules.
_Avoid_: rail, track

**Free time**:
Unscheduled time between activities on the timeline.
_Avoid_: empty slot (UI), hole

**Now line**:
The current-time indicator on the timeline.
_Avoid_: red line, cursor

**Unscheduled**:
A task with a date but no start time; shown as "Anytime" in the editor.
_Avoid_: backlog

### Kinds of activity

**Task**:
A responsibility that can be completed; may be unscheduled.
_Avoid_: todo

**Event**:
A commitment at a fixed time, optionally with a location; shown tinted in the Calendar.
_Avoid_: appointment (in code)

**Routine**:
A reusable sequence of steps; added to a day as one activity whose subtasks are the steps.
_Avoid_: template

**Steps**:
The timed lines that make up a routine.
_Avoid_: subtasks

**Subtask**:
A checklist line inside an activity.
_Avoid_: step (steps belong to routines)

**Habit**:
A recurring behavior with a daily or weekly frequency and a check-in per date.
_Avoid_: streak (the streak is derived)

**Check-in**:
A habit's completion record for one date.

**Inbox item**:
A raw capture in the Inbox, not yet an activity.
_Avoid_: note

**Priority**:
A task's importance: none, low, medium or high. High shows a flag on the capsule.

**Label**:
A grouping name on an activity (Work, Personal, Health, Errand, Learning), shown with the `Tag` primitive.
_Avoid_: category

**Repeat**:
An activity's recurrence preset: never, daily, weekdays or weekly.
_Avoid_: recurrence rule (in UI)

**Streak**:
The run of consecutive dates (or weeks, for weekly habits) a habit was checked in. Always derived, never stored.

**Daily progress**:
Completed activities plus checked-in habits, divided by the total for the date. Derived.

**Focus session**:
A timed run of attention on one activity, started from its detail.
_Avoid_: pomodoro

### Longer horizons

**Goal**:
Long-term direction made of milestones.

**Milestone**:
A completion marker on a goal or a project.

**Project**:
Related work with a deadline, tracked as a list or a board.

**Journal entry**:
A dated reflection with a mood and free text.

**Mood**:
A journal entry's rating from 1 (Rough) to 5 (Great); each level has a hue.

### Color

**Hue**:
One of the nine activity colors an activity is tinted with.
_Avoid_: color, theme color
