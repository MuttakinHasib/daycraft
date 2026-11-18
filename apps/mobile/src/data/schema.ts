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
    routineId: text('routine_id'),
    status: text('status'),
    ...syncColumns,
  },
  (table) => [
    index('activity_date_idx').on(table.activityDate),
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
