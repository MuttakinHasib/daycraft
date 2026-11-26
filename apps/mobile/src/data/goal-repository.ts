import {
  todayISO,
  type Goal,
  type GoalChanges,
  type GoalInput,
  type ISODate,
  type Milestone,
  type MilestoneChange,
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
    description: row.description ?? null,
    targetDate: (row.targetDate as ISODate | null) ?? null,
    hue: row.hue as Goal['hue'],
    createdDate: row.createdDate as ISODate,
    milestones,
  };
}

interface MilestoneEdit {
  goalId: string;
  changes: readonly MilestoneChange[];
  newId: () => string;
  tx: AppDatabase;
}

/** Rewrites the goal's milestones to the edit's list, in its order: a kept id keeps its done flag, an absent id
 * is a new open milestone, and a row that left the list is gone. */
function applyMilestoneChanges({ goalId, changes, newId, tx }: MilestoneEdit): void {
  const current = tx.select().from(goalMilestone).where(eq(goalMilestone.goalId, goalId)).all();
  const byId = new Map(current.map((row) => [row.id, row]));
  const keptIds = new Set(changes.flatMap((change) => (change.id ? [change.id] : [])));
  for (const row of current) {
    if (!keptIds.has(row.id)) tx.delete(goalMilestone).where(eq(goalMilestone.id, row.id)).run();
  }
  changes.forEach((change, position) => {
    const kept = change.id ? byId.get(change.id) : undefined;
    if (kept) {
      tx.update(goalMilestone).set({ title: change.title, position }).where(eq(goalMilestone.id, kept.id)).run();
    } else {
      tx.insert(goalMilestone)
        .values({ id: newId(), goalId, position, title: change.title, done: false })
        .run();
    }
  });
}

export interface GoalRepository {
  create(input: GoalInput): Goal;
  /** Live goals (not deleted) in creation order, each with its milestones in their position order. */
  listLiveGoals(): Goal[];
  /** One goal by id with its milestones, or null when it is gone. */
  readGoal(id: string): Goal | null;
  /**
   * Applies the changes to the goal; `targetDate: null` clears the target date, `description: null` the
   * description, and `milestones` replaces the list in its given order, keeping a kept id's done flag.
   */
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
        description: input.description ?? null,
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

    readGoal(id) {
      const row = db.select().from(goal).where(eq(goal.id, id)).get();
      if (!row) return null;
      const milestones = db
        .select()
        .from(goalMilestone)
        .where(eq(goalMilestone.goalId, id))
        .orderBy(asc(goalMilestone.position))
        .all()
        .map(toMilestone);
      return toGoal(row, milestones);
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
      db.transaction((tx) => {
        const values: Partial<GoalRow> = { updatedAt: now };
        if (changes.title !== undefined) values.title = changes.title;
        if (changes.description !== undefined) values.description = changes.description;
        if (changes.hue !== undefined) values.hue = changes.hue;
        if (changes.targetDate !== undefined) values.targetDate = changes.targetDate;
        tx.update(goal).set(values).where(eq(goal.id, id)).run();
        if (changes.milestones !== undefined) {
          applyMilestoneChanges({ goalId: id, changes: changes.milestones, newId: deps.newId, tx });
        }
      });
      notify();
      const updated = this.readGoal(id);
      if (!updated) throw new Error(`No goal ${id}`);
      return updated;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
