import type { Activity } from './activity';

/** Seconds in one minute. */
const SECONDS_PER_MINUTE = 60;
/** Milliseconds in one second: the one place clock readings become seconds. */
const MS_PER_SECOND = 1_000;
/** What the −5 and +5 controls change the remaining time by. */
const STEP_SECONDS = 5 * SECONDS_PER_MINUTE;
/** The least remaining time the −5 control leaves, so a session can't vanish by accident. */
const MIN_REMAINING_SECONDS = 30;

/** A focus session while it is live: its length, when it started and how long it has been paused. */
export interface FocusTimer {
  /** The session's total length in seconds; the −5 and +5 controls change it. */
  lengthSeconds: number;
  /** The clock reading in epoch milliseconds when the session started. */
  startedAt: number;
  /** Seconds accumulated in pauses before the current one; an open pause is not included. */
  pausedSeconds: number;
  /** The clock reading in epoch milliseconds when the current pause began, or null while running. */
  pausedAt: number | null;
}

/** What Start focus begins a session from: a chosen length and the clock reading at the press. */
export interface StartFocusInput {
  /** The chosen length in minutes, one of the setup chips. */
  lengthMinutes: number;
  /** The clock reading in epoch milliseconds when Start focus is pressed. */
  now: number;
}

/** What the Done screen's line is built from: the focused time and the activity it was on. */
export interface DoneLineInput {
  /** The seconds actually focused, as `focusedSeconds` reports them. */
  focusedSeconds: number;
  /** The focused activity's title, or null when the session had no activity. */
  activityTitle: string | null;
}

/** The clock reading a query freezes at: the current pause's start while paused, the passed clock while running. */
function frozenAt(timer: FocusTimer, now: number): number {
  return timer.pausedAt ?? now;
}

/** Seconds the session has run for, excluding every pause, up to the frozen clock reading. */
function elapsedSeconds(timer: FocusTimer, now: number): number {
  return (frozenAt(timer, now) - timer.startedAt) / MS_PER_SECOND - timer.pausedSeconds;
}

/** The session a Start focus begins: running, with nothing paused yet. */
export function startFocus({ lengthMinutes, now }: StartFocusInput): FocusTimer {
  return { lengthSeconds: lengthMinutes * SECONDS_PER_MINUTE, startedAt: now, pausedSeconds: 0, pausedAt: null };
}

/** The timer paused at `now`: it holds the remaining time it had. Pausing twice keeps the first pause. */
export function pauseFocus(timer: FocusTimer, now: number): FocusTimer {
  if (timer.pausedAt !== null) return timer;
  return { ...timer, pausedAt: now };
}

/** The timer resumed at `now`: the pause joins the accumulated paused time. Resuming while running changes nothing. */
export function resumeFocus(timer: FocusTimer, now: number): FocusTimer {
  if (timer.pausedAt === null) return timer;
  const pausedFor = (now - timer.pausedAt) / MS_PER_SECOND;
  return { ...timer, pausedSeconds: timer.pausedSeconds + pausedFor, pausedAt: null };
}

/** The seconds left to focus, from the session's start time, its length and its paused time. Zero past its end. */
export function remainingSeconds(timer: FocusTimer, now: number): number {
  return Math.max(0, timer.lengthSeconds - elapsedSeconds(timer, now));
}

/** True when no time remains: the session is complete. */
export function isComplete(timer: FocusTimer, now: number): boolean {
  return remainingSeconds(timer, now) === 0;
}

/** The seconds actually focused: the time the session ran, excluding pauses, capped at the total length. */
export function focusedSeconds(timer: FocusTimer, now: number): number {
  const elapsed = elapsedSeconds(timer, now);
  return Math.min(timer.lengthSeconds, Math.max(0, elapsed));
}

/** The timer with its remaining time set to `seconds`, by changing the total: the focused time is untouched. */
function withRemaining(timer: FocusTimer, now: number, seconds: number): FocusTimer {
  return { ...timer, lengthSeconds: focusedSeconds(timer, now) + seconds };
}

/** The timer after the −5 control: five minutes less to focus, and never below 30 seconds remaining. */
export function subtractFiveMinutes(timer: FocusTimer, now: number): FocusTimer {
  const remaining = remainingSeconds(timer, now);
  const next = Math.max(remaining - STEP_SECONDS, Math.min(remaining, MIN_REMAINING_SECONDS));
  return withRemaining(timer, now, next);
}

/** The timer after the +5 control: five minutes more to focus, at any length. */
export function addFiveMinutes(timer: FocusTimer, now: number): FocusTimer {
  return withRemaining(timer, now, remainingSeconds(timer, now) + STEP_SECONDS);
}

/**
 * The Done screen's line: `You focused for X min Y s on {title}`, or `on no activity` when the session
 * had none. The focused time is rounded to the nearest whole second.
 */
export function doneLine({ focusedSeconds, activityTitle }: DoneLineInput): string {
  const total = Math.round(focusedSeconds);
  const minutes = Math.floor(total / SECONDS_PER_MINUTE);
  const seconds = total % SECONDS_PER_MINUTE;
  return `You focused for ${minutes} min ${seconds} s on ${activityTitle ?? 'no activity'}`;
}

/**
 * Whether the Done screen offers **Mark task as done**: only for a session on an activity that is not
 * already done, so the offer is never a no-op. A session with no activity never sees it.
 */
export function canMarkTaskDone(activity: Activity | null): boolean {
  return activity !== null && !activity.done;
}
