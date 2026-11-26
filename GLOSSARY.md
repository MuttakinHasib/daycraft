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

**Day edges**:
When a person's day starts and ends, set in onboarding as two daily routines, Rise and shine and Wind down. Not stored apart from those routines; the timeline itself runs from the day's first activity to its last.
_Avoid_: day limits, working hours, Wake up and Bedtime (as anchors)

**Activity sheet**:
The one sheet that creates, shows and edits a task or event. It opens ready to edit; there is no separate view or edit screen.
_Avoid_: detail sheet, editor, edit screen

**Unscheduled**:
A task with a date but no start time; shown as "Anytime" in the activity sheet.
_Avoid_: backlog

### Kinds of activity

**Task**:
A responsibility that can be completed; may be unscheduled.
_Avoid_: todo

**Event**:
A commitment at a fixed time, optionally with a location; never unscheduled.
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

**Target**:
How many days a week a weekly habit wants a check-in: 1 to 7.
_Avoid_: goal

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

**Occurrence**:
One dated activity created from a repeating activity. Changing it asks whether the change is for this task only, all future tasks or all tasks; completing it is always for that date only.
_Avoid_: instance (in code)

**Streak**:
The run of consecutive periods in which a habit met its frequency: days for a daily habit, weeks for a weekly habit. The current day or week never breaks it, and time before the habit existed does not count. Always derived, never stored.

**Daily progress**:
Completed activities plus checked-in habits, divided by the total for the date. Derived.

**Focus session**:
A timed run of attention on one activity, started from its activity sheet.
_Avoid_: pomodoro

### Longer horizons

**Goal**:
Long-term direction made of milestones.

**Target date**:
A goal's date by which it should be reached. Not the habit's **Target**.
_Avoid_: deadline (that is a project's), due date

**Milestone**:
A completion marker on a goal or a project.

**Project**:
Related work with a deadline, tracked as a list or a board.

**Journal entry**:
A dated reflection with a mood and free text.

**Mood**:
A journal entry's rating from 1 (Rough) to 5 (Great); each level has a hue.

### First run

**Splash**:
The launch animation in which the logo builds itself, shown on every launch.
_Avoid_: launch screen (that is the plain native background under it)

**Onboarding**:
The screens shown once per device before the first Plan: the intro, then setup steps that create the day edges routines, daily habits and one task. Never named in UI copy.
_Avoid_: tutorial, walkthrough, welcome

### Color

**Hue**:
The color an activity is tinted with: one of the nine named activity colors, or a custom color the person picks.
_Avoid_: color, theme color
