import type { ISODate } from './calendar';

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
