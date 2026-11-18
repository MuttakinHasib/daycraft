import type { MinutesOfDay } from '../calendar';

/** The timeline's first minute: 5:00 AM. */
export const DAY_START: MinutesOfDay = 300;
/** The timeline's end: midnight. */
export const DAY_END: MinutesOfDay = 1440;
/** Every time on the timeline moves in steps of this many minutes. */
export const SNAP_MINUTES = 5;
/** The shortest duration a drag or the editor can give a timed activity. */
export const MIN_DURATION = 5;

/** A start and a duration on the timeline. */
export interface Timing {
  start: MinutesOfDay;
  durationMinutes: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Keeps an activity on the timeline: nothing starts before 5:00 AM or ends after midnight. The start stays in
 * `[DAY_START, DAY_END − max(duration, 5)]` and the duration in `[5, DAY_END − start]`. A duration of 0 stays 0
 * (a point in time). Drag and the editor both use this rule.
 */
export function clampToDay(timing: Timing): Timing {
  const pointInTime = timing.durationMinutes === 0;
  const duration = pointInTime ? 0 : clamp(timing.durationMinutes, MIN_DURATION, DAY_END - DAY_START);
  const start = clamp(timing.start, DAY_START, DAY_END - Math.max(duration, MIN_DURATION));
  return { start, durationMinutes: pointInTime ? 0 : Math.min(duration, DAY_END - start) };
}

/** Minutes moved by a vertical drag of `deltaY` points at `scale` points per minute, in 5-minute steps. */
export function snapMinutes(deltaY: number, scale: number): number {
  return Math.round(deltaY / scale / SNAP_MINUTES) * SNAP_MINUTES || 0;
}

/** The timing after dragging the capsule by `deltaMinutes`: the duration is kept and the start is limited to the day. */
export function movedTiming(original: Timing, deltaMinutes: number): Timing {
  const start = clamp(
    original.start + deltaMinutes,
    DAY_START,
    DAY_END - Math.max(original.durationMinutes, MIN_DURATION),
  );
  return { start, durationMinutes: original.durationMinutes };
}

/** The timing after dragging the bottom grip by `deltaMinutes`: the start is kept and the duration is limited to the day. */
export function resizedTiming(original: Timing, deltaMinutes: number): Timing {
  return {
    start: original.start,
    durationMinutes: clamp(original.durationMinutes + deltaMinutes, MIN_DURATION, DAY_END - original.start),
  };
}
