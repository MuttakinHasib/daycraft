import { todayISO, type ISODate } from './calendar';
import { focusedSeconds, isComplete, type FocusTimer } from './focus';

/** A focus session (glossary): a timed run of attention on one activity, or on none, recorded once when it ends. */
export interface FocusSession {
  id: string;
  /** The activity the session focused on, or null when it had none. */
  activityId: string | null;
  /** The local date the session ran on. */
  sessionDate: ISODate;
  /** The session's planned length in seconds. */
  plannedSeconds: number;
  /** The time actually focused in seconds, excluding paused time; less than planned when it ended early. */
  focusedSeconds: number;
}

/** What saving a finished session starts from: the Focus screen's record of the run that just ended. */
export interface FocusSessionInput {
  /** The activity the session focused on, or null when it had none. */
  activityId: string | null;
  /** The local date the session ran on. */
  sessionDate: ISODate;
  /** The session's planned length in seconds. */
  plannedSeconds: number;
  /** The time actually focused in seconds, excluding paused time; less than planned when it ended early. */
  focusedSeconds: number;
}

/** What ending a session records: its live timer, the clock reading at the end, and the activity it focused on. */
export interface EndedSessionInput {
  /** The timer at the moment the session ended, whether by **End session** or by running out. */
  timer: FocusTimer;
  /** The clock reading in epoch milliseconds when the session ended. */
  now: number;
  /** The activity the session focused on, or null when it had none. */
  activityId: string | null;
}

/**
 * The record a session ended at `now` saves: the plan the −5 and +5 controls left, the time actually focused
 * rounded to the whole second, and the local day it ended on — the day the record is filed under.
 */
export function endedSession({ timer, now, activityId }: EndedSessionInput): FocusSessionInput {
  return {
    activityId,
    sessionDate: todayISO(new Date(now)),
    plannedSeconds: timer.lengthSeconds,
    focusedSeconds: Math.round(focusedSeconds(timer, now)),
  };
}

/** What the app hands the domain at open, when a session may have been interrupted by the app closing. */
export interface RecoveredSessionInput {
  /** The timer kept in the key-value store, or null when no session was stored. */
  timer: FocusTimer | null;
  /** The activity the stored session focused on, or null when it had none. */
  activityId: string | null;
  /** The clock reading when the stored state was last written, in epoch milliseconds. */
  recordedAt: number;
}

/**
 * The record an interrupted session saves when the app opens again, or null when none was stored. The
 * session ends at its last recorded time — the paused time while paused, the last write while running —
 * so the clock at reopen never pads the record with time nobody focused for.
 */
export function recoveredSession({
  timer,
  activityId,
  recordedAt,
}: RecoveredSessionInput): FocusSessionInput | null {
  if (timer === null) return null;
  return endedSession({ timer, now: timer.pausedAt ?? recordedAt, activityId });
}

/** What opening Focus does with a session the key-value store still holds. */
export const StoredSessionAction = {
  /** Nothing usable was stored: setup opens as usual. */
  NONE: 'none',
  /** The session's time has run out: save it and open on its Done state. */
  RECOVER: 'recover',
  /** The session still has time: open it as the live timer it was, leaving the store untouched. */
  RESTORE: 'restore',
} as const;
export type StoredSessionAction = (typeof StoredSessionAction)[keyof typeof StoredSessionAction];

/** What the restore decision is made from: the stored timer, and the clock at reopen. */
export interface StoredSessionInput {
  /** The timer kept in the key-value store, or null when no session was stored. */
  timer: FocusTimer | null;
  /** The clock reading in epoch milliseconds when Focus opens. */
  now: number;
}

/**
 * What opening Focus does with a stored session, by the domain's clock alone: none when nothing was
 * stored, recover once no time remains — the session ran out while the app was away, so save it and
 * show its Done state — and restore while it still has time, paused or running, so the session goes
 * on exactly as the close that left it never happened.
 */
export function storedSessionAction({ timer, now }: StoredSessionInput): StoredSessionAction {
  if (timer === null) return StoredSessionAction.NONE;
  return isComplete(timer, now) ? StoredSessionAction.RECOVER : StoredSessionAction.RESTORE;
}
