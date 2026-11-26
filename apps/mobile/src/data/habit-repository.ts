import {
  checkInId,
  todayISO,
  type Habit,
  type HabitInput,
  type ISODate,
} from '@daycraft/domain';
import { and, asc, eq, isNull } from 'drizzle-orm';

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

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
