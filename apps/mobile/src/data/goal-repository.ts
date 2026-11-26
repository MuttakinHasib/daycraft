import {
  todayISO,
  type Goal,
  type GoalChanges,
  type GoalInput,
  type ISODate,
} from '@daycraft/domain';
import { asc, eq, isNull } from 'drizzle-orm';

import { type AppDatabase } from './activity-repository';
import { goal, type GoalRow } from './schema';

// The only way screens touch goal data. Inputs and outputs are domain types; rows never leave this file.

export interface GoalRepositoryDeps {
  newId: () => string;
  now: () => Date;
}

type Listener = () => void;

function toGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    targetDate: (row.targetDate as ISODate | null) ?? null,
    hue: row.hue as Goal['hue'],
    createdDate: row.createdDate as ISODate,
  };
}

export interface GoalRepository {
  create(input: GoalInput): Goal;
  /** Live goals (not deleted) in creation order. */
  listLiveGoals(): Goal[];
  /** Applies the changes to the goal; `targetDate: null` clears the target date. */
  update(id: string, changes: GoalChanges): Goal;
  /** Calls `listener` after every write. Returns the function that stops it. */
  subscribe(listener: Listener): () => void;
}

export function createGoalRepository(db: AppDatabase, deps: GoalRepositoryDeps): GoalRepository {
  const listeners = new Set<Listener>();
  const notify = () => listeners.forEach((listener) => listener());

  return {
    create(input) {
      const now = deps.now().toISOString();
      const row: GoalRow = {
        id: deps.newId(),
        title: input.title,
        targetDate: input.targetDate ?? null,
        hue: input.hue,
        createdDate: todayISO(deps.now()),
        deletedDate: null,
        createdAt: now,
        updatedAt: now,
      };
      db.insert(goal).values(row).run();
      notify();
      return toGoal(row);
    },

    listLiveGoals() {
      return db
        .select()
        .from(goal)
        .where(isNull(goal.deletedDate))
        .orderBy(asc(goal.createdAt), asc(goal.id))
        .all()
        .map(toGoal);
    },

    update(id, changes) {
      const now = deps.now().toISOString();
      const values: Partial<GoalRow> = { updatedAt: now };
      if (changes.targetDate !== undefined) values.targetDate = changes.targetDate;
      db.update(goal).set(values).where(eq(goal.id, id)).run();
      notify();
      const row = db.select().from(goal).where(eq(goal.id, id)).get();
      return toGoal(row as GoalRow);
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
