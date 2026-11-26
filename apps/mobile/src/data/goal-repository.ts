import {
  todayISO,
  type Goal,
  type GoalChanges,
  type GoalInput,
  type ISODate,
  type Milestone,
} from '@daycraft/domain';
import { asc, eq, inArray, isNull } from 'drizzle-orm';

import { type AppDatabase } from './activity-repository';
import { goal, goalMilestone, type GoalMilestoneRow, type GoalRow } from './schema';

// The only way screens touch goal data. Inputs and outputs are domain types; rows never leave this file.

export interface GoalRepositoryDeps {
  newId: () => string;
  now: () => Date;
}

type Listener = () => void;

function toMilestone(row: GoalMilestoneRow): Milestone {
  return { id: row.id, title: row.title, done: row.done };
}

function toGoal(row: GoalRow, milestones: Milestone[]): Goal {
  return {
    id: row.id,
    title: row.title,
    targetDate: (row.targetDate as ISODate | null) ?? null,
    hue: row.hue as Goal['hue'],
    createdDate: row.createdDate as ISODate,
    milestones,
  };
}

export interface GoalRepository {
  create(input: GoalInput): Goal;
  /** Live goals (not deleted) in creation order, each with its milestones in their position order. */
  listLiveGoals(): Goal[];
  /** Applies the changes to the goal; `targetDate: null` clears the target date. */
  update(id: string, changes: GoalChanges): Goal;
  /** Flips one milestone's done flag. Returns whether it is done after the toggle, for the caller's toast. */
  toggleMilestone(id: string): boolean;
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
      const rows = input.milestones.map((milestone, position) => ({
        id: deps.newId(),
        goalId: row.id,
        position,
        title: milestone.title,
        done: false,
      }));
      db.transaction((tx) => {
        tx.insert(goal).values(row).run();
        if (rows.length > 0) tx.insert(goalMilestone).values(rows).run();
      });
      notify();
      return toGoal(row, rows.map(toMilestone));
    },

    listLiveGoals() {
      const rows = db
        .select()
        .from(goal)
        .where(isNull(goal.deletedDate))
        .orderBy(asc(goal.createdAt), asc(goal.id))
        .all();
      if (rows.length === 0) return [];
      // One read for every goal's milestones, grouped per goal in position order, as the activity's subtasks are.
      const byGoal = new Map<string, Milestone[]>();
      const milestoneRows = db
        .select()
        .from(goalMilestone)
        .where(inArray(goalMilestone.goalId, rows.map((row) => row.id)))
        .orderBy(asc(goalMilestone.position))
        .all();
      for (const milestoneRow of milestoneRows) {
        const list = byGoal.get(milestoneRow.goalId) ?? [];
        list.push(toMilestone(milestoneRow));
        byGoal.set(milestoneRow.goalId, list);
      }
      return rows.map((row) => toGoal(row, byGoal.get(row.id) ?? []));
    },

    toggleMilestone(id) {
      const row = db.select().from(goalMilestone).where(eq(goalMilestone.id, id)).get();
      if (!row) throw new Error(`No milestone ${id}`);
      const done = !row.done;
      db.update(goalMilestone).set({ done }).where(eq(goalMilestone.id, id)).run();
      notify();
      return done;
    },

    update(id, changes) {
      const now = deps.now().toISOString();
      const values: Partial<GoalRow> = { updatedAt: now };
      if (changes.targetDate !== undefined) values.targetDate = changes.targetDate;
      db.update(goal).set(values).where(eq(goal.id, id)).run();
      notify();
      const row = db.select().from(goal).where(eq(goal.id, id)).get();
      if (!row) throw new Error(`No goal ${id}`);
      const milestones = db
        .select()
        .from(goalMilestone)
        .where(eq(goalMilestone.goalId, id))
        .orderBy(asc(goalMilestone.position))
        .all()
        .map(toMilestone);
      return toGoal(row, milestones);
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
