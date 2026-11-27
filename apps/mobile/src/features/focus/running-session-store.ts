import { type FocusSessionInput, type FocusTimer, recoveredSession } from '@daycraft/domain';
import { Storage } from 'expo-sqlite/kv-store';

import { focusSessionRepository } from '@/data/focus-store';
import { cancelAllFocusEndNotifications } from '@/features/focus/focus-notification';

// Device-only, like the onboarding flag (the focus spec's persistence-on-close): the running
// session's state, kept in the key-value store so it survives the app closing.
const RUNNING_SESSION_KEY = 'runningFocusSession';

/** The running session's state as the key-value store holds it: what recovery needs to rebuild the record. */
export interface RunningSession {
  /** The live timer: its length, start time, paused time and the open pause. */
  timer: FocusTimer;
  /** The activity the session focuses on, or null when it has none. */
  activityId: string | null;
  /** The clock reading when this state was last written, in epoch milliseconds. */
  recordedAt: number;
}

/** A timer as the store wrote it: checked field by field, so a corrupt blob is nothing rather than a crash. */
function isStoredTimer(value: unknown): value is FocusTimer {
  if (typeof value !== 'object' || value === null) return false;
  const { lengthSeconds, startedAt, pausedSeconds, pausedAt } = value as Record<string, unknown>;
  return (
    typeof lengthSeconds === 'number' &&
    typeof startedAt === 'number' &&
    typeof pausedSeconds === 'number' &&
    (pausedAt === null || typeof pausedAt === 'number')
  );
}

/** The stored session, or null when nothing usable was stored: unreadable counts as never written. */
export function readRunningSession(): RunningSession | null {
  const raw = Storage.getItemSync(RUNNING_SESSION_KEY);
  if (raw === null) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return null;
    const { timer, activityId, recordedAt } = value as Record<string, unknown>;
    if (!isStoredTimer(timer)) return null;
    if (typeof activityId !== 'string' && activityId !== null) return null;
    if (typeof recordedAt !== 'number') return null;
    return { timer, activityId, recordedAt };
  } catch {
    return null;
  }
}

/** Keeps the running session's state, written at start, at pause and resume, at length changes, and when the app leaves the foreground. */
export function saveRunningSession(session: RunningSession) {
  Storage.setItemSync(RUNNING_SESSION_KEY, JSON.stringify(session));
}

/** Clears the stored state: the session ended, so there is nothing left to recover. */
export function clearRunningSession() {
  Storage.removeItemSync(RUNNING_SESSION_KEY);
}

/**
 * Saves the session that the app closing interrupted, once, and returns the record it saved — or
 * null when nothing usable was stored. Whatever was pending of its end notification is cancelled
 * with it: a session that ends at its last recorded time must not still announce its planned end.
 * The stored state is cleared in the same step, so a second open finds nothing and never saves the
 * session twice. The recovery is silent — the app opens on Plan, not on Focus — unless the launch
 * came from the end notification, whose Focus shows the returned record as its Done state.
 */
export function recoverInterruptedSession(): FocusSessionInput | null {
  cancelAllFocusEndNotifications();
  const stored = readRunningSession();
  const record = stored === null ? null : recoveredSession(stored);
  if (record !== null) focusSessionRepository.saveSession(record);
  clearRunningSession();
  return record;
}
