import type { MinutesOfDay } from '../calendar';

/** The timeline's first minute: 5:00 AM. */
export const DAY_START: MinutesOfDay = 300;
/** The timeline's end: midnight. */
export const DAY_END: MinutesOfDay = 1440;
/** Every time on the timeline moves in steps of this many minutes. */
export const SNAP_MINUTES = 5;
/** The shortest duration a drag or the editor can give a timed activity. */
export const MIN_DURATION = 5;

export interface Timing {
  start: MinutesOfDay;
  durationMinutes: number;
}

/** An inclusive range of minutes. */
interface Bounds {
  min: number;
  max: number;
}

function clamp(value: number, { min, max }: Bounds): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Keeps an activity between 5:00 AM and midnight, with a duration of at least 5 (0 stays 0, a point in time).
 * Drag and the editor share this rule.
 */
export function clampToDay(timing: Timing): Timing {
  const pointInTime = timing.durationMinutes === 0;
  const duration = pointInTime ? 0 : clamp(timing.durationMinutes, { min: MIN_DURATION, max: DAY_END - DAY_START });
  const start = clamp(timing.start, { min: DAY_START, max: DAY_END - Math.max(duration, MIN_DURATION) });
  return { start, durationMinutes: pointInTime ? 0 : Math.min(duration, DAY_END - start) };
}

/** Minutes moved by a vertical drag of `deltaY` points at `scale` points per minute, in 5-minute steps. */
export function snapMinutes(deltaY: number, scale: number): number {
  return Math.round(deltaY / scale / SNAP_MINUTES) * SNAP_MINUTES || 0;
}

/** The timing after dragging the capsule by `deltaMinutes`: the duration is kept and the start is limited to the day. */
export function movedTiming(original: Timing, deltaMinutes: number): Timing {
  const start = clamp(original.start + deltaMinutes, {
    min: DAY_START,
    max: DAY_END - Math.max(original.durationMinutes, MIN_DURATION),
  });
  return { start, durationMinutes: original.durationMinutes };
}

/** The timing after dragging the bottom grip by `deltaMinutes`: the start is kept and the duration is limited to the day. */
export function resizedTiming(original: Timing, deltaMinutes: number): Timing {
  return {
    start: original.start,
    durationMinutes: clamp(original.durationMinutes + deltaMinutes, {
      min: MIN_DURATION,
      max: DAY_END - original.start,
    }),
  };
}
