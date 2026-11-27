import { type FocusSession, type FocusSessionInput, type ISODate } from '@daycraft/domain';
import { asc, eq } from 'drizzle-orm';

import { type AppDatabase } from './activity-repository';
import { focusSession, type FocusSessionRow } from './schema';

// The only way screens touch focus session data. Inputs and outputs are domain types; rows never leave this file.

export interface FocusSessionRepositoryDeps {
  newId: () => string;
  now: () => Date;
}

function toSession(row: FocusSessionRow): FocusSession {
  return {
    id: row.id,
    activityId: row.activityId,
    sessionDate: row.sessionDate as ISODate,
    plannedSeconds: row.plannedSeconds,
    focusedSeconds: row.focusedSeconds,
  };
}

export interface FocusSessionRepository {
  /** Saves one ended session: written once when it ends, never edited in v1. */
  saveSession(input: FocusSessionInput): FocusSession;
  /** The sessions saved on the local date, oldest first. */
  readSessionsOn(date: ISODate): FocusSession[];
}

export function createFocusSessionRepository(
  db: AppDatabase,
  deps: FocusSessionRepositoryDeps,
): FocusSessionRepository {
  return {
    saveSession(input) {
      // Append-only: one insert when the session ends; nothing edits the row afterwards.
      const now = deps.now().toISOString();
      const row: FocusSessionRow = {
        id: deps.newId(),
        activityId: input.activityId,
        sessionDate: input.sessionDate,
        plannedSeconds: input.plannedSeconds,
        focusedSeconds: input.focusedSeconds,
        createdAt: now,
        updatedAt: now,
      };
      db.insert(focusSession).values(row).run();
      return toSession(row);
    },

    readSessionsOn(date) {
      return db
        .select()
        .from(focusSession)
        .where(eq(focusSession.sessionDate, date))
        .orderBy(asc(focusSession.createdAt), asc(focusSession.id))
        .all()
        .map(toSession);
    },
  };
}
