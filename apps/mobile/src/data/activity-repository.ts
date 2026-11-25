import {
  ActivityKind,
  completionToggled,
  isActivityColor,
  toHexColor,
  isActivityKind,
  isIconName,
  isLabel,
  isPriority,
  isRepeat,
  addDays,
  DayEdge,
  isDayEdges,
  DAYCRAFT_NAMESPACE,
  daysBetween,
  EditScope,
  formatRule,
  occurrenceDates,
  occurrenceId,
  parseRule,
  Priority,
  Repeat,
  repeatOf,
  ruleFor,
  templateChanged,
  uuidV5,
  type Activity,
  type ActivityChanges,
  type ActivityColor,
  type HexColor,
  type ActivityInput,
  type ISODate,
  type OnboardingOutcome,
  type OnboardingTask,
  type Subtask,
  type SubtaskInput,
  type DayEdges,
  type RepeatRule,
  type Timing,
} from '@daycraft/domain';
import { and, asc, eq, gte, inArray, isNotNull, isNull, like, lte, ne, or } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import { activity, activitySeries, subtask, type ActivityRow, type SeriesRow, type SubtaskRow } from './schema';

// The only way screens touch activity data. Inputs and outputs are domain types; rows never leave this file.

// Both the Expo driver and the Node driver used in tests are synchronous Drizzle databases.
export type AppDatabase = BaseSQLiteDatabase<'sync', unknown, Record<string, unknown>>;

/** What the repository needs from the platform: ids and the time. */
export interface RepositoryDeps {
  newId: () => string;
  now: () => Date;
}

/** Each date's distinct activity hues, at most four, routines left out. */
export type WeekDots = Record<ISODate, ActivityColor[]>;

type Listener = () => void;

interface SubtaskWrite {
  activityId: string;
  inputs: SubtaskInput[];
}

interface ActivityWrite {
  id: string;
  changes: ActivityChanges;
}

export interface ActivityRepository {
  readDay(date: ISODate): Activity[];
  readActivity(id: string): Activity | null;
  readWeekDots(dates: ISODate[]): WeekDots;
  /** The custom hex colors activities use, oldest edit first, for the colour picker's recent presets. */
  readUsedCustomColors(): HexColor[];
  /** Calls `listener` after every write. Returns the function that stops it. */
  subscribe(listener: Listener): () => void;
  /** A repeating input creates its series and the occurrence on its date. */
  create(input: ActivityInput): Activity;
  /**
   * For an occurrence, `scope` says where a change to what the series shares goes (this date only by default).
   * The result is the occurrence on the same date.
   */
  update(id: string, changes: ActivityChanges, scope?: EditScope): Activity;
  reschedule(id: string, timing: Timing, scope?: EditScope): Activity;
  toggleDone(id: string): Activity;
  toggleSubtask(id: string): void;
  remove(id: string, scope?: EditScope): void;
  /** The day edges from that date's Rise and shine and Wind down routines, or null before onboarding saved them. */
  readDayEdges(date: ISODate): DayEdges | null;
  /**
   * Saves what onboarding ended with, in one transaction: the day edges as the two daily routines from `date` (or
   * moved from `date` on), and the task on `date` unless there is none (Skip). Returns the task.
   */
  saveOnboarding(outcome: OnboardingOutcome, date: ISODate): Activity | null;
}

interface DayEdgeRoutine {
  edge: DayEdge;
  minute: number;
  date: ISODate;
}

/** The routines that hold the day edges, by title (onboarding doc). */
const DAY_EDGE_TITLES: Record<DayEdge, string> = { wakeUp: 'Rise and shine', windDown: 'Wind down' };

function dayEdgeRoutine({ edge, minute, date }: DayEdgeRoutine): ActivityInput {
  const wakeUp = edge === DayEdge.WAKE_UP;
  return {
    date,
    start: minute,
    durationMinutes: 0,
    title: DAY_EDGE_TITLES[edge],
    hue: wakeUp ? 'clay' : 'slate',
    icon: wakeUp ? 'alarm' : 'moon',
    kind: ActivityKind.ROUTINE,
    done: false,
    notes: '',
    subtasks: [],
    repeat: Repeat.DAILY,
    priority: Priority.NONE,
    labels: [],
    location: '',
    projectId: null,
    seriesId: null,
  };
}

/** The task onboarding adds, as a new activity on its date. */
function onboardingTask(task: OnboardingTask, date: ISODate): ActivityInput {
  return {
    date,
    start: task.start,
    durationMinutes: task.durationMinutes,
    title: task.title,
    hue: task.hue,
    icon: task.icon,
    kind: ActivityKind.TASK,
    done: false,
    notes: '',
    subtasks: [],
    repeat: Repeat.NEVER,
    priority: Priority.NONE,
    labels: [],
    location: '',
    projectId: null,
    seriesId: null,
  };
}

interface SeriesEdit {
  row: ActivityRow;
  series: SeriesRow;
  draft: ActivityInput;
  changes: ActivityChanges;
  scope: EditScope;
}

interface SeriesRemoval {
  row: ActivityRow;
  series: SeriesRow;
  scope: EditScope;
}

interface SeriesValues {
  id: string;
  rule: RepeatRule;
  startDate: ISODate;
  draft: ActivityInput;
}

interface OccurrenceRewrite {
  series: SeriesRow;
  draft: ActivityInput;
  rule: RepeatRule;
  /** Rows of this series on or after this date are rewritten. */
  fromDate: ISODate;
  /** The series they move to (the same one unless the series was split). */
  targetSeriesId: string;
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
    hue: isActivityColor(row.hue) ? (toHexColor(row.hue) ?? row.hue) : 'slate',
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
    seriesId: row.seriesId,
  };
}

function parseTitles(json: string): string[] {
  try {
    const value: unknown = JSON.parse(json);
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
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
  function writeSubtasks(tx: AppDatabase, { activityId, inputs }: SubtaskWrite) {
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

  // The transaction that is open while a write runs. A write made inside it joins it instead of opening its own:
  // the edges and the task of one onboarding save, or the occurrences a read creates on the way.
  let openTx: AppDatabase | null = null;

  function transact<T>(run: (tx: AppDatabase) => T): T {
    if (openTx) return run(openTx);
    return db.transaction((tx) => {
      openTx = tx as unknown as AppDatabase;
      try {
        return run(openTx);
      } finally {
        openTx = null;
      }
    });
  }

  function write<T>(run: (tx: AppDatabase) => T): T {
    // Only the write that opened the transaction tells listeners, once everything in it is saved.
    const outermost = openTx === null;
    const result = transact(run);
    if (outermost) notify();
    return result;
  }

  function applyChanges(tx: AppDatabase, { id, changes }: ActivityWrite) {
    const row = tx
      .select({ doneAt: activity.doneAt })
      .from(activity)
      .where(and(eq(activity.id, id), isNull(activity.deletedAt)))
      .get();
    if (!row) throw new Error(`No activity ${id}`);
    tx.update(activity).set(activityValues(changes, row.doneAt)).where(eq(activity.id, id)).run();
    if (changes.subtasks) writeSubtasks(tx, { activityId: id, inputs: changes.subtasks });
  }

  function seriesValues({ id, rule, startDate, draft }: SeriesValues) {
    const now = stamp();
    return {
      id,
      rrule: formatRule(rule),
      startDate,
      untilDate: null,
      startMinute: draft.start,
      durationMinutes: draft.durationMinutes,
      title: draft.title,
      hue: draft.hue,
      icon: draft.icon,
      kind: draft.kind,
      notes: draft.notes,
      priority: draft.priority,
      labels: JSON.stringify(draft.labels),
      location: draft.location,
      subtasks: JSON.stringify(draft.subtasks.map((item) => item.title)),
      createdAt: now,
      updatedAt: now,
    };
  }

  function seriesTemplate(series: SeriesRow) {
    return {
      startMinute: series.startMinute,
      durationMinutes: series.durationMinutes,
      title: series.title,
      hue: series.hue,
      icon: series.icon,
      kind: series.kind,
      notes: series.notes,
      priority: series.priority,
      labels: series.labels,
      location: series.location,
    };
  }

  // Creates the occurrences of every live series on these dates that don't exist yet (a deleted one is a
  // tombstone and stays deleted). Rows are found by series and date, so a date is never created twice.
  function materialize(dates: readonly ISODate[]) {
    if (dates.length === 0) return;
    const sorted = [...dates].sort();
    const from = sorted[0]!;
    const to = sorted.at(-1)!;
    const wanted = new Set(dates);
    const live = db
      .select()
      .from(activitySeries)
      .where(
        and(
          isNull(activitySeries.deletedAt),
          lte(activitySeries.startDate, to),
          or(isNull(activitySeries.untilDate), gte(activitySeries.untilDate, from)),
        ),
      )
      .all();
    for (const series of live) {
      const rule = parseRule(series.rrule);
      if (!rule) continue;
      const due = occurrenceDates({
        rule,
        start: series.startDate as ISODate,
        until: series.untilDate as ISODate | null,
        from,
        to,
      }).filter((date) => wanted.has(date));
      if (due.length === 0) continue;
      const existing = new Set(
        db
          .select({ date: activity.activityDate })
          .from(activity)
          .where(and(eq(activity.seriesId, series.id), inArray(activity.activityDate, due)))
          .all()
          .map((row) => row.date),
      );
      const missing = due.filter((date) => !existing.has(date));
      if (missing.length === 0) continue;
      const now = stamp();
      const titles = parseTitles(series.subtasks);
      transact((tx) => {
        for (const date of missing) {
          const id = occurrenceId(series.id, date);
          tx.insert(activity)
            .values({
              ...seriesTemplate(series),
              id,
              activityDate: date,
              repeat: repeatOf(rule),
              seriesId: series.id,
              createdAt: now,
              updatedAt: now,
            })
            .onConflictDoNothing()
            .run();
          titles.forEach((title, position) => {
            tx.insert(subtask)
              .values({
                id: uuidV5(DAYCRAFT_NAMESPACE, `subtask:${id}:${position}`),
                activityId: id,
                title,
                position,
                createdAt: now,
                updatedAt: now,
              })
              .onConflictDoNothing()
              .run();
          });
        }
      });
    }
  }

  function readRow(tx: AppDatabase, id: string): ActivityRow {
    const row = tx
      .select()
      .from(activity)
      .where(and(eq(activity.id, id), isNull(activity.deletedAt)))
      .get();
    if (!row) throw new Error(`No activity ${id}`);
    return row;
  }

  function readSeries(tx: AppDatabase, id: string | null): SeriesRow | null {
    if (!id) return null;
    return tx.select().from(activitySeries).where(eq(activitySeries.id, id)).get() ?? null;
  }

  function softDelete(tx: AppDatabase, ids: string[]) {
    if (ids.length === 0) return;
    const now = stamp();
    tx.update(activity).set({ deletedAt: now, updatedAt: now }).where(inArray(activity.id, ids)).run();
    tx.update(subtask)
      .set({ deletedAt: now, updatedAt: now })
      .where(and(inArray(subtask.activityId, ids), isNull(subtask.deletedAt)))
      .run();
  }

  // The live rows of a series on or after a date.
  function seriesRowsFrom(tx: AppDatabase, seriesId: string, fromDate: ISODate): ActivityRow[] {
    return tx
      .select()
      .from(activity)
      .where(and(eq(activity.seriesId, seriesId), gte(activity.activityDate, fromDate), isNull(activity.deletedAt)))
      .all();
  }

  // Ends a series the day before `date`; a series that would end before it starts is deleted.
  function endSeriesBefore(tx: AppDatabase, series: SeriesRow, date: ISODate) {
    const now = stamp();
    const lastDate = addDays(date, -1);
    const values =
      daysBetween(series.startDate as ISODate, lastDate) < 0
        ? { deletedAt: now, updatedAt: now }
        : { untilDate: lastDate, updatedAt: now };
    tx.update(activitySeries).set(values).where(eq(activitySeries.id, series.id)).run();
  }

  // Rewrites what the series shares on its rows from a date: rows that are done or detached keep theirs, and rows
  // on dates the rule no longer falls on are deleted.
  function rewriteOccurrences(tx: AppDatabase, { series, draft, rule, fromDate, targetSeriesId }: OccurrenceRewrite) {
    const now = stamp();
    const start = (targetSeriesId === series.id ? series.startDate : fromDate) as ISODate;
    const dropped: string[] = [];
    for (const row of seriesRowsFrom(tx, series.id, fromDate)) {
      if (row.doneAt !== null || row.detachedAt !== null) continue;
      const date = row.activityDate as ISODate;
      const stillOn = occurrenceDates({ rule, start, until: null, from: date, to: date }).length > 0;
      if (!stillOn) {
        dropped.push(row.id);
        continue;
      }
      tx.update(activity)
        .set({
          seriesId: targetSeriesId,
          startMinute: draft.start,
          durationMinutes: draft.durationMinutes,
          title: draft.title,
          hue: draft.hue,
          icon: draft.icon,
          kind: draft.kind,
          repeat: repeatOf(rule),
          updatedAt: now,
        })
        .where(eq(activity.id, row.id))
        .run();
    }
    softDelete(tx, dropped);
  }

  // A change to an occurrence that reaches past its own date ("all future tasks" or "all tasks").
  function editSeries(tx: AppDatabase, { row, series, draft, changes, scope }: SeriesEdit) {
    const date = row.activityDate as ISODate;
    const fromDate = (scope === EditScope.ALL ? series.startDate : date) as ISODate;
    const now = stamp();
    applyChanges(tx, { id: row.id, changes });

    if (draft.repeat === Repeat.NEVER) {
      // Repeat off: the series ends on this date, which stays as a one-off (detached).
      endSeriesBefore(tx, series, addDays(date, 1));
      const later = seriesRowsFrom(tx, series.id, addDays(date, 1))
        .filter((item) => item.doneAt === null && item.detachedAt === null)
        .map((item) => item.id);
      softDelete(tx, later);
      tx.update(activity).set({ detachedAt: now }).where(eq(activity.id, row.id)).run();
      return;
    }

    const oldRule = parseRule(series.rrule);
    const repeatChanged = !oldRule || repeatOf(oldRule) !== draft.repeat;
    const rule = (repeatChanged ? ruleFor(draft.repeat, fromDate) : oldRule) ?? oldRule;
    if (!rule) return;
    const splits = daysBetween(series.startDate as ISODate, fromDate) > 0;
    if (splits) {
      // From this date on the series continues as a new one; the old one ends the day before.
      const newId = deps.newId();
      tx.insert(activitySeries)
        .values(seriesValues({ id: newId, rule, startDate: fromDate, draft }))
        .run();
      endSeriesBefore(tx, series, fromDate);
      rewriteOccurrences(tx, { series, draft, rule, fromDate, targetSeriesId: newId });
    } else {
      tx.update(activitySeries)
        .set({
          ...seriesValues({ id: series.id, rule, startDate: series.startDate as ISODate, draft }),
          createdAt: series.createdAt,
        })
        .where(eq(activitySeries.id, series.id))
        .run();
      rewriteOccurrences(tx, { series, draft, rule, fromDate, targetSeriesId: series.id });
    }
    // The edited date always takes the change, even when done.
    tx.update(activity)
      .set({ repeat: repeatOf(rule), updatedAt: now })
      .where(eq(activity.id, row.id))
      .run();
  }

  // Makes a one-off repeat: a series starts on its date, and the activity becomes that date's occurrence.
  function startSeries(tx: AppDatabase, row: ActivityRow, draft: ActivityInput) {
    const date = row.activityDate as ISODate;
    const rule = ruleFor(draft.repeat, date);
    if (!rule) return;
    const seriesId = deps.newId();
    tx.insert(activitySeries)
      .values(seriesValues({ id: seriesId, rule, startDate: date, draft }))
      .run();
    tx.update(activity).set({ seriesId, detachedAt: null, updatedAt: stamp() }).where(eq(activity.id, row.id)).run();
  }

  function update(id: string, changes: ActivityChanges, scope: EditScope = EditScope.THIS): Activity {
    write((tx) => {
      const row = readRow(tx, id);
      const saved = mustRead(id);
      const { id: _id, ...savedFields } = saved;
      const draft: ActivityInput = { ...savedFields, ...changes } as ActivityInput;
      const series = row.detachedAt === null ? readSeries(tx, row.seriesId) : null;
      const liveSeries = series && series.deletedAt === null ? series : null;

      if (!liveSeries) {
        applyChanges(tx, { id, changes });
        if (saved.repeat === Repeat.NEVER && draft.repeat !== Repeat.NEVER) startSeries(tx, readRow(tx, id), draft);
        return;
      }
      if (scope === EditScope.THIS || !templateChanged(savedFields, draft)) {
        applyChanges(tx, { id, changes });
        if (templateChanged(savedFields, draft)) {
          tx.update(activity).set({ detachedAt: stamp() }).where(eq(activity.id, id)).run();
        }
        return;
      }
      editSeries(tx, { row, series: liveSeries, draft, changes, scope });
    });
    return mustRead(id);
  }

  function removeFromSeries(tx: AppDatabase, { row, series, scope }: SeriesRemoval) {
    const date = row.activityDate as ISODate;
    const fromDate = (scope === EditScope.ALL ? series.startDate : date) as ISODate;
    endSeriesBefore(tx, series, fromDate);
    const doomed = seriesRowsFrom(tx, series.id, fromDate)
      .filter((item) => item.doneAt === null || item.id === row.id)
      .map((item) => item.id);
    softDelete(tx, [...new Set([...doomed, row.id])]);
  }

  // Saves the day edges as the two daily routines from `date`, or moves the existing ones from that date on.
  function saveDayEdges(edges: DayEdges, date: ISODate) {
    if (!isDayEdges(edges)) throw new Error('Day edges break the rules');
    const day = repository.readDay(date);
    for (const edge of [DayEdge.WAKE_UP, DayEdge.WIND_DOWN] as const) {
      const minute = edges[edge];
      const existing = day.find((item) => item.seriesId && item.title === DAY_EDGE_TITLES[edge]);
      if (existing) {
        // Replay moves the routine from this date on; earlier dates keep their time.
        if (existing.start !== minute) repository.update(existing.id, { start: minute }, EditScope.FUTURE);
        continue;
      }
      repository.create(dayEdgeRoutine({ edge, minute, date }));
    }
  }

  const repository: ActivityRepository = {
    readActivity,

    readDay(date) {
      materialize([date]);
      const rows = db
        .select()
        .from(activity)
        .where(and(eq(activity.activityDate, date), isNull(activity.deletedAt)))
        .orderBy(asc(activity.startMinute), asc(activity.durationMinutes), asc(activity.createdAt))
        .all();
      const subtasks = subtasksFor(rows.map((row) => row.id));
      return rows.map((row) => toActivity(row, subtasks.get(row.id) ?? []));
    },

    readUsedCustomColors() {
      return db
        .select({ hue: activity.hue })
        .from(activity)
        .where(and(isNull(activity.deletedAt), like(activity.hue, '#%')))
        .orderBy(asc(activity.updatedAt))
        .all()
        .map((row) => toHexColor(row.hue))
        .filter((hex): hex is HexColor => hex !== null);
    },

    readWeekDots(dates) {
      const dots = Object.fromEntries(dates.map((date) => [date, [] as ActivityColor[]])) as WeekDots;
      if (dates.length === 0) return dots;
      materialize(dates);
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
        if (list && isActivityColor(row.hue) && !list.includes(row.hue) && list.length < MAX_DOTS) list.push(row.hue);
      }
      return dots;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    create(input) {
      const rule = ruleFor(input.repeat, input.date);
      const seriesId = rule ? deps.newId() : null;
      const id = seriesId ? occurrenceId(seriesId, input.date) : deps.newId();
      const now = stamp();
      write((tx) => {
        if (rule && seriesId) {
          tx.insert(activitySeries)
            .values(seriesValues({ id: seriesId, rule, startDate: input.date, draft: input }))
            .run();
        }
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
            repeat: rule ? repeatOf(rule) : input.repeat,
            labels: JSON.stringify(input.labels),
            location: input.location,
            projectId: input.projectId,
            seriesId,
            createdAt: now,
            updatedAt: now,
          })
          .run();
        writeSubtasks(tx, { activityId: id, inputs: input.subtasks });
      });
      return mustRead(id);
    },

    update,

    reschedule(id, timing, scope) {
      return update(id, { start: timing.start, durationMinutes: timing.durationMinutes }, scope);
    },

    toggleDone(id) {
      write((tx) => {
        const toggled = completionToggled(mustRead(id));
        applyChanges(tx, { id, changes: { done: toggled.done, subtasks: toggled.subtasks } });
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

    remove(id, scope = EditScope.THIS) {
      write((tx) => {
        const row = readRow(tx, id);
        const series = row.detachedAt === null ? readSeries(tx, row.seriesId) : null;
        // A deleted occurrence stays as a tombstone, so its date is not created again.
        if (!series || series.deletedAt !== null || scope === EditScope.THIS) softDelete(tx, [id]);
        else removeFromSeries(tx, { row, series, scope });
      });
    },

    saveOnboarding(outcome, date) {
      const task = outcome.task && onboardingTask(outcome.task, date);
      let created: Activity | null = null;
      write(() => {
        saveDayEdges(outcome.dayEdges, date);
        if (task) created = repository.create(task);
      });
      return created;
    },

    readDayEdges(date) {
      const routines = repository.readDay(date);
      const wakeUp = routines.find((item) => item.seriesId && item.title === DAY_EDGE_TITLES.wakeUp);
      const windDown = routines.find((item) => item.seriesId && item.title === DAY_EDGE_TITLES.windDown);
      if (wakeUp?.start == null || windDown?.start == null) return null;
      return { wakeUp: wakeUp.start, windDown: windDown.start };
    },
  };
  return repository;
}
