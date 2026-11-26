import {
  checkInId,
  todayISO,
  type Habit,
  type HabitChanges,
  type HabitInput,
  type ISODate,
} from '@daycraft/domain';
import { and, asc, eq, gt, isNull, lte, or } from 'drizzle-orm';

import { type AppDatabase } from './activity-repository';
import { habit, habitCheckIn, type HabitCheckInRow, type HabitRow } from './schema';

// The only way screens touch habit data. Inputs and outputs are domain types; rows never leave this file.

export interface RepositoryDeps {
  newId: () => string;
  now: () => Date;
}

type Listener = () => void;

function toHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon as Habit['icon'],
    hue: row.hue as Habit['hue'],
    frequency: row.frequency as Habit['frequency'],
    target: row.target,
    createdDate: row.createdDate as ISODate,
    deletedDate: (row.deletedDate as ISODate | null) ?? null,
  };
}

export interface HabitRepository {
  create(input: HabitInput): Habit;
  /** Live habits (not deleted) in creation order. */
  listLiveHabits(): Habit[];
  /** The habits that existed on the date (created on or before it, deleted after it), in creation order. */
  readHabitsOn(date: ISODate): Habit[];
  /** One habit by id, or null when it is gone. */
  readHabit(id: string): Habit | null;
  /** Applies the changes to the habit; the streak is re-derived from the check-ins, which stay. */
  update(id: string, changes: HabitChanges): Habit;
  /** Soft delete: the habit leaves today onward; its check-ins are kept for the dates it existed. */
  remove(id: string): void;
  /**
   * Writes onboarding's chosen habits inside the transaction the caller opened (the one that saves the routines
   * and the task), each created on `date`. Calls the listeners after, once the caller commits.
   */
  createOnboardingHabits(input: { habits: readonly HabitInput[]; date: ISODate; tx: AppDatabase }): void;
  /** Checking in twice writes the same row (the id is derived), never a duplicate. */
  checkIn(habitId: string, date: ISODate): void;
  uncheckIn(habitId: string, date: ISODate): void;
  /** The habit's check-in dates, oldest first. */
  readCheckInDates(habitId: string): ISODate[];
  /** The habits checked in on the date, in creation order. */
  readCheckedHabitIds(date: ISODate): string[];
  /** Calls `listener` after every write. Returns the function that stops it. */
  subscribe(listener: Listener): () => void;
}

export function createHabitRepository(db: AppDatabase, deps: RepositoryDeps): HabitRepository {
  const listeners = new Set<Listener>();
  const notify = () => listeners.forEach((listener) => listener());

  return {
    create(input) {
      const now = deps.now().toISOString();
      const row: HabitRow = {
        id: deps.newId(),
        name: input.name,
        icon: input.icon,
        hue: input.hue,
        frequency: input.frequency,
        target: input.target,
        createdDate: todayISO(deps.now()),
        deletedDate: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
      db.insert(habit).values(row).run();
      notify();
      return toHabit(row);
    },

    listLiveHabits() {
      return db
        .select()
        .from(habit)
        .where(isNull(habit.deletedAt))
        .orderBy(asc(habit.createdAt), asc(habit.id))
        .all()
        .map(toHabit);
    },

    readHabitsOn(date) {
      return db
        .select()
        .from(habit)
        .where(and(lte(habit.createdDate, date), or(isNull(habit.deletedDate), gt(habit.deletedDate, date))))
        .orderBy(asc(habit.createdAt), asc(habit.id))
        .all()
        .map(toHabit);
    },

    readHabit(id) {
      const row = db.select().from(habit).where(eq(habit.id, id)).get();
      return row ? toHabit(row as HabitRow) : null;
    },

    update(id, changes) {
      const now = deps.now().toISOString();
      const values: Partial<HabitRow> = { updatedAt: now };
      if (changes.name !== undefined) values.name = changes.name;
      if (changes.icon !== undefined) values.icon = changes.icon;
      if (changes.hue !== undefined) values.hue = changes.hue;
      if (changes.frequency !== undefined) values.frequency = changes.frequency;
      if (changes.target !== undefined) values.target = changes.target;
      db.update(habit).set(values).where(eq(habit.id, id)).run();
      notify();
      return this.readHabit(id) as Habit;
    },

    remove(id) {
      const now = deps.now();
      db.update(habit)
        .set({ deletedDate: todayISO(now), deletedAt: now.toISOString(), updatedAt: now.toISOString() })
        .where(eq(habit.id, id))
        .run();
      notify();
    },

    checkIn(habitId, date) {
      const now = deps.now().toISOString();
      db.insert(habitCheckIn)
        .values({ id: checkInId(habitId, date), habitId, checkInDate: date, createdAt: now, updatedAt: now, deletedAt: null })
        .onConflictDoNothing()
        .run();
      notify();
    },

    uncheckIn(habitId, date) {
      db.delete(habitCheckIn).where(and(eq(habitCheckIn.habitId, habitId), eq(habitCheckIn.checkInDate, date))).run();
      notify();
    },

    readCheckInDates(habitId) {
      return db
        .select()
        .from(habitCheckIn)
        .where(eq(habitCheckIn.habitId, habitId))
        .orderBy(asc(habitCheckIn.checkInDate))
        .all()
        .map((row: HabitCheckInRow) => row.checkInDate as ISODate);
    },

    readCheckedHabitIds(date) {
      return db
        .select({ habitId: habitCheckIn.habitId })
        .from(habitCheckIn)
        .where(eq(habitCheckIn.checkInDate, date))
        .all()
        .map((row) => row.habitId);
    },

    createOnboardingHabits({ habits, date, tx }) {
      const now = deps.now().toISOString();
      for (const input of habits) {
        tx.insert(habit)
          .values({
            id: deps.newId(),
            name: input.name,
            icon: input.icon,
            hue: input.hue,
            frequency: input.frequency,
            target: input.target,
            createdDate: date,
            deletedDate: null,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          })
          .run();
      }
      notify();
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
