import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Tables follow the glossary (ADR-0005). A delete sets `deleted_at` and every read filters it out;
// timestamps are UTC ISO strings, and hue and icon hold domain names, never colors or library names.

const syncColumns = {
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
};

export const activity = sqliteTable(
  'activity',
  {
    id: text('id').primaryKey(),
    activityDate: text('activity_date').notNull(),
    // Null for an unscheduled task.
    startMinute: integer('start_minute'),
    durationMinutes: integer('duration_minutes').notNull().default(0),
    title: text('title').notNull(),
    hue: text('hue').notNull(),
    icon: text('icon').notNull(),
    kind: text('kind').notNull(),
    doneAt: text('done_at'),
    notes: text('notes').notNull().default(''),
    priority: text('priority').notNull().default('none'),
    repeat: text('repeat').notNull().default('never'),
    // A JSON array of label names.
    labels: text('labels').notNull().default('[]'),
    location: text('location').notNull().default(''),
    // For later slices: projects, goals, repeat series and routines.
    projectId: text('project_id'),
    goalId: text('goal_id'),
    seriesId: text('series_id'),
    // Set when an occurrence was changed on its own ("this task only"): series edits leave it alone.
    detachedAt: text('detached_at'),
    routineId: text('routine_id'),
    status: text('status'),
    ...syncColumns,
  },
  (table) => [
    index('activity_date_idx').on(table.activityDate),
    index('activity_series_date_idx').on(table.seriesId, table.activityDate),
    check('activity_event_has_start', sql`${table.kind} <> 'event' OR ${table.startMinute} IS NOT NULL`),
  ],
);

export const subtask = sqliteTable(
  'subtask',
  {
    id: text('id').primaryKey(),
    activityId: text('activity_id')
      .notNull()
      .references(() => activity.id),
    title: text('title').notNull(),
    doneAt: text('done_at'),
    position: integer('position').notNull(),
    ...syncColumns,
  },
  (table) => [index('subtask_activity_idx').on(table.activityId)],
);

// A repeating activity (ADR-0006): the rule and what each new occurrence starts with. Occurrences are activity rows.
export const activitySeries = sqliteTable('activity_series', {
  id: text('id').primaryKey(),
  rrule: text('rrule').notNull(),
  startDate: text('start_date').notNull(),
  // Null while the series runs on; the last date once "all future tasks" changes or deletes it.
  untilDate: text('until_date'),
  startMinute: integer('start_minute'),
  durationMinutes: integer('duration_minutes').notNull().default(0),
  title: text('title').notNull(),
  hue: text('hue').notNull(),
  icon: text('icon').notNull(),
  kind: text('kind').notNull(),
  notes: text('notes').notNull().default(''),
  priority: text('priority').notNull().default('none'),
  labels: text('labels').notNull().default('[]'),
  location: text('location').notNull().default(''),
  // A JSON array of subtask titles each new occurrence starts with, unticked.
  subtasks: text('subtasks').notNull().default('[]'),
  ...syncColumns,
});

// A habit and its check-ins (ADR-0005): children are rows, and the check-in's id is a v5 id of (habit, date),
// so checking in twice writes the same row. created_date and deleted_date are local calendar dates (glossary).
export const habit = sqliteTable('habit', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  hue: text('hue').notNull(),
  frequency: text('frequency').notNull(),
  // Null for a daily habit; 1–7 for a weekly one.
  target: integer('target'),
  createdDate: text('created_date').notNull(),
  deletedDate: text('deleted_date'),
  ...syncColumns,
});

export const habitCheckIn = sqliteTable(
  'habit_check_in',
  {
    id: text('id').primaryKey(),
    habitId: text('habit_id')
      .notNull()
      .references(() => habit.id),
    checkInDate: text('check_in_date').notNull(),
    ...syncColumns,
  },
  (table) => [index('habit_check_in_habit_idx').on(table.habitId, table.checkInDate)],
);

// A goal (Goals): a long-term direction, never an activity. Its hue is a domain name, as on habits. Like a habit,
// a delete sets `deleted_date`, a local calendar date, and every read filters it out.
export const goal = sqliteTable('goal', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  // What the goal is working toward, in the author's words; null when it has none.
  description: text('description'),
  // The local date the goal should be reached by (glossary); null when it has none.
  targetDate: text('target_date'),
  hue: text('hue').notNull(),
  createdDate: text('created_date').notNull(),
  deletedDate: text('deleted_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// A goal's milestones (glossary): ordered by position, with no dates in v1. `done` is a flag rather than a
// timestamp because nothing reads when a milestone was reached. The goal's soft delete hides them with it.
export const goalMilestone = sqliteTable(
  'goal_milestone',
  {
    id: text('id').primaryKey(),
    goalId: text('goal_id')
      .notNull()
      .references(() => goal.id),
    position: integer('position').notNull(),
    title: text('title').notNull(),
    done: integer('done', { mode: 'boolean' }).notNull().default(false),
  },
  (table) => [index('goal_milestone_goal_idx').on(table.goalId, table.position)],
);

// A focus session (glossary): one timed run of attention, written once when the session ends and never edited
// in v1, so it has no deleted_at. The activity it focused on is null when it had none.
export const focusSession = sqliteTable(
  'focus_session',
  {
    id: text('id').primaryKey(),
    activityId: text('activity_id').references(() => activity.id),
    // The local date the session ran on (glossary), as on activities and check-ins.
    sessionDate: text('session_date').notNull(),
    plannedSeconds: integer('planned_seconds').notNull(),
    focusedSeconds: integer('focused_seconds').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('focus_session_date_idx').on(table.sessionDate)],
);

// Created now so that sync can be added without a migration that touches every write. Nothing reads it yet.
export const syncOutbox = sqliteTable('sync_outbox', {
  id: text('id').primaryKey(),
  entity: text('entity').notNull(),
  entityId: text('entity_id').notNull(),
  operation: text('operation').notNull(),
  payload: text('payload').notNull(),
  createdAt: text('created_at').notNull(),
});

export type ActivityRow = typeof activity.$inferSelect;
export type SubtaskRow = typeof subtask.$inferSelect;
export type SeriesRow = typeof activitySeries.$inferSelect;
export type HabitRow = typeof habit.$inferSelect;
export type HabitCheckInRow = typeof habitCheckIn.$inferSelect;
export type GoalRow = typeof goal.$inferSelect;
export type GoalMilestoneRow = typeof goalMilestone.$inferSelect;
export type FocusSessionRow = typeof focusSession.$inferSelect;
