import {
  ActivityKind,
  completionToggled,
  isActivityHue,
  isActivityKind,
  isIconName,
  isLabel,
  isPriority,
  isRepeat,
  Priority,
  Repeat,
  type Activity,
  type ActivityChanges,
  type ActivityHue,
  type ActivityInput,
  type ISODate,
  type Subtask,
  type SubtaskInput,
  type Timing,
} from '@daycraft/domain';
import { and, asc, eq, inArray, isNotNull, isNull, ne } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import { activity, subtask, type ActivityRow, type SubtaskRow } from './schema';

// The only way screens touch activity data. Inputs and outputs are domain types; rows never leave this file.

// Both the Expo driver and the Node driver used in tests are synchronous Drizzle databases.
export type AppDatabase = BaseSQLiteDatabase<'sync', any, any>;

/** What the repository needs from the platform: ids and the time. */
export interface RepositoryDeps {
  newId: () => string;
  now: () => Date;
}

/** Each date's distinct activity hues, at most four, routines left out. */
export type WeekDots = Record<ISODate, ActivityHue[]>;

type Listener = () => void;

export interface ActivityRepository {
  readDay(date: ISODate): Activity[];
  readActivity(id: string): Activity | null;
  readWeekDots(dates: ISODate[]): WeekDots;
  /** Calls `listener` after every write. Returns the function that stops it. */
  subscribe(listener: Listener): () => void;
  create(input: ActivityInput): Activity;
  update(id: string, changes: ActivityChanges): Activity;
  reschedule(id: string, timing: Timing): Activity;
  toggleDone(id: string): Activity;
  toggleSubtask(id: string): void;
  remove(id: string): void;
}

const MAX_DOTS = 4;

function parseLabels(json: string): Activity['labels'] {
  try {
    const value: unknown = JSON.parse(json);
    return Array.isArray(value) ? value.filter(isLabel) : [];
  } catch {
    return [];
  }
}

function toSubtask(row: SubtaskRow): Subtask {
  return { id: row.id, title: row.title, done: row.doneAt !== null };
}

function toActivity(row: ActivityRow, subtasks: Subtask[]): Activity {
  return {
    id: row.id,
    date: row.activityDate as ISODate,
    start: row.startMinute,
    durationMinutes: row.durationMinutes,
    title: row.title,
    hue: isActivityHue(row.hue) ? row.hue : 'slate',
    icon: isIconName(row.icon) ? row.icon : 'check',
    kind: isActivityKind(row.kind) ? row.kind : ActivityKind.TASK,
    done: row.doneAt !== null,
    notes: row.notes,
    subtasks,
    repeat: isRepeat(row.repeat) ? row.repeat : Repeat.NEVER,
    priority: isPriority(row.priority) ? row.priority : Priority.NONE,
    labels: parseLabels(row.labels),
    location: row.location,
    projectId: row.projectId,
  };
}

export function createActivityRepository(db: AppDatabase, deps: RepositoryDeps): ActivityRepository {
  const listeners = new Set<Listener>();
  const notify = () => listeners.forEach((listener) => listener());
  const stamp = () => deps.now().toISOString();

  function subtasksFor(activityIds: string[]): Map<string, Subtask[]> {
    const byActivity = new Map<string, Subtask[]>();
    if (activityIds.length === 0) return byActivity;
    const rows = db
      .select()
      .from(subtask)
      .where(and(inArray(subtask.activityId, activityIds), isNull(subtask.deletedAt)))
      .orderBy(asc(subtask.position))
      .all();
    for (const row of rows) {
      const list = byActivity.get(row.activityId) ?? [];
      list.push(toSubtask(row));
      byActivity.set(row.activityId, list);
    }
    return byActivity;
  }

  function readActivity(id: string): Activity | null {
    const row = db
      .select()
      .from(activity)
      .where(and(eq(activity.id, id), isNull(activity.deletedAt)))
      .get();
    if (!row) return null;
    return toActivity(row, subtasksFor([id]).get(id) ?? []);
  }

  function mustRead(id: string): Activity {
    const found = readActivity(id);
    if (!found) throw new Error(`No activity ${id}`);
    return found;
  }

  // Replaces the activity's subtask list: kept ids are updated, missing ones soft-deleted, new ones inserted.
  function writeSubtasks(tx: AppDatabase, activityId: string, inputs: SubtaskInput[]) {
    const now = stamp();
    const existing = tx
      .select()
      .from(subtask)
      .where(and(eq(subtask.activityId, activityId), isNull(subtask.deletedAt)))
      .all();
    const keep = new Set(inputs.map((input) => input.id).filter((id): id is string => id !== undefined));
    for (const row of existing) {
      if (!keep.has(row.id)) {
        tx.update(subtask).set({ deletedAt: now, updatedAt: now }).where(eq(subtask.id, row.id)).run();
      }
    }
    const existingById = new Map(existing.map((row) => [row.id, row]));
    inputs.forEach((input, position) => {
      const previous = input.id ? existingById.get(input.id) : undefined;
      const doneAt = input.done ? (previous?.doneAt ?? now) : null;
      if (previous) {
        tx.update(subtask)
          .set({ title: input.title, doneAt, position, updatedAt: now })
          .where(eq(subtask.id, previous.id))
          .run();
      } else {
        tx.insert(subtask)
          .values({
            id: deps.newId(),
            activityId,
            title: input.title,
            doneAt,
            position,
            createdAt: now,
            updatedAt: now,
          })
          .run();
      }
    });
  }

  function activityValues(input: ActivityChanges, previousDoneAt: string | null) {
    const now = stamp();
    return {
      ...(input.date !== undefined && { activityDate: input.date }),
      ...(input.start !== undefined && { startMinute: input.start }),
      ...(input.durationMinutes !== undefined && { durationMinutes: input.durationMinutes }),
      ...(input.title !== undefined && { title: input.title }),
      ...(input.hue !== undefined && { hue: input.hue }),
      ...(input.icon !== undefined && { icon: input.icon }),
      ...(input.kind !== undefined && { kind: input.kind }),
      ...(input.done !== undefined && { doneAt: input.done ? (previousDoneAt ?? now) : null }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.repeat !== undefined && { repeat: input.repeat }),
      ...(input.labels !== undefined && { labels: JSON.stringify(input.labels) }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.projectId !== undefined && { projectId: input.projectId }),
      updatedAt: now,
    };
  }

  function write<T>(run: (tx: AppDatabase) => T): T {
    const result = db.transaction((tx) => run(tx as unknown as AppDatabase));
    notify();
    return result;
  }

  function applyChanges(tx: AppDatabase, id: string, changes: ActivityChanges) {
    const row = tx
      .select({ doneAt: activity.doneAt })
      .from(activity)
      .where(and(eq(activity.id, id), isNull(activity.deletedAt)))
      .get();
    if (!row) throw new Error(`No activity ${id}`);
    tx.update(activity).set(activityValues(changes, row.doneAt)).where(eq(activity.id, id)).run();
    if (changes.subtasks) writeSubtasks(tx, id, changes.subtasks);
  }

  function update(id: string, changes: ActivityChanges): Activity {
    write((tx) => applyChanges(tx, id, changes));
    return mustRead(id);
  }

  return {
    readActivity,

    readDay(date) {
      const rows = db
        .select()
        .from(activity)
        .where(and(eq(activity.activityDate, date), isNull(activity.deletedAt)))
        .orderBy(asc(activity.startMinute), asc(activity.durationMinutes), asc(activity.createdAt))
        .all();
      const subtasks = subtasksFor(rows.map((row) => row.id));
      return rows.map((row) => toActivity(row, subtasks.get(row.id) ?? []));
    },

    readWeekDots(dates) {
      const dots = Object.fromEntries(dates.map((date) => [date, [] as ActivityHue[]])) as WeekDots;
      if (dates.length === 0) return dots;
      const rows = db
        .select({ date: activity.activityDate, hue: activity.hue })
        .from(activity)
        .where(
          and(
            inArray(activity.activityDate, dates),
            isNull(activity.deletedAt),
            isNotNull(activity.startMinute),
            ne(activity.kind, ActivityKind.ROUTINE),
          ),
        )
        .orderBy(asc(activity.startMinute))
        .all();
      for (const row of rows) {
        const list = dots[row.date as ISODate];
        if (list && isActivityHue(row.hue) && !list.includes(row.hue) && list.length < MAX_DOTS) list.push(row.hue);
      }
      return dots;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    create(input) {
      const id = deps.newId();
      const now = stamp();
      write((tx) => {
        tx.insert(activity)
          .values({
            id,
            activityDate: input.date,
            startMinute: input.start,
            durationMinutes: input.durationMinutes,
            title: input.title,
            hue: input.hue,
            icon: input.icon,
            kind: input.kind,
            doneAt: input.done ? now : null,
            notes: input.notes,
            priority: input.priority,
            repeat: input.repeat,
            labels: JSON.stringify(input.labels),
            location: input.location,
            projectId: input.projectId,
            createdAt: now,
            updatedAt: now,
          })
          .run();
        writeSubtasks(tx, id, input.subtasks);
      });
      return mustRead(id);
    },

    update,

    reschedule(id, timing) {
      return update(id, { start: timing.start, durationMinutes: timing.durationMinutes });
    },

    toggleDone(id) {
      write((tx) => {
        const toggled = completionToggled(mustRead(id));
        applyChanges(tx, id, { done: toggled.done, subtasks: toggled.subtasks });
      });
      return mustRead(id);
    },

    toggleSubtask(id) {
      const row = db
        .select()
        .from(subtask)
        .where(and(eq(subtask.id, id), isNull(subtask.deletedAt)))
        .get();
      if (!row) throw new Error(`No subtask ${id}`);
      const now = stamp();
      write((tx) => {
        tx.update(subtask)
          .set({ doneAt: row.doneAt ? null : now, updatedAt: now })
          .where(eq(subtask.id, id))
          .run();
        tx.update(activity).set({ updatedAt: now }).where(eq(activity.id, row.activityId)).run();
      });
    },

    remove(id) {
      const now = stamp();
      write((tx) => {
        tx.update(activity).set({ deletedAt: now, updatedAt: now }).where(eq(activity.id, id)).run();
        tx.update(subtask)
          .set({ deletedAt: now, updatedAt: now })
          .where(and(eq(subtask.activityId, id), isNull(subtask.deletedAt)))
          .run();
      });
    },
  };
}
