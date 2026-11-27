import { todayISO, type ISODate } from './calendar';
import { focusedSeconds, type FocusTimer } from './focus';

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
