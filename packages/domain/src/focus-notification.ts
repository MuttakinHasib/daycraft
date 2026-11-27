import { isComplete, remainingSeconds, type FocusTimer } from './focus';

/** Milliseconds in one second: the one place the fire time becomes a clock reading. */
const MS_PER_SECOND = 1_000;

/** What the end-notification decision is made from: the live timer, the clock, and the permission. */
export interface FocusEndNotificationInput {
  /** The live timer, or null when no session is running: setup, or once it has ended. */
  timer: FocusTimer | null;
  /** The clock reading in epoch milliseconds at the moment of the decision. */
  now: number;
  /** Whether the notification permission is granted; without it Focus works, notifying no one. */
  notificationPermission: boolean;
}

/**
 * When the session-end notification should fire, in epoch milliseconds, or null when none should be
 * scheduled (the spec's rule): without the permission, with no live session, in a pause — which
 * cancels the one there was — or once the session is complete. A running session fires at its end,
 * the same moment from any clock reading it is asked at, so the −5 and +5 controls and a resume
 * reschedule for the end they leave.
 */
export function focusEndNotificationAt({
  timer,
  now,
  notificationPermission,
}: FocusEndNotificationInput): number | null {
  if (!notificationPermission) return null;
  if (timer === null || timer.pausedAt !== null) return null;
  if (isComplete(timer, now)) return null;
  return now + remainingSeconds(timer, now) * MS_PER_SECOND;
}
