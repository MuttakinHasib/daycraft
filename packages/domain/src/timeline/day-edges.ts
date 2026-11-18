import type { MinutesOfDay } from '../calendar';
import { DAY_END, DAY_START } from './day-limits';

/** The two daily times that bound the timeline (glossary: Day edges). */
export interface DayEdges {
  wakeUp: MinutesOfDay;
  bedtime: MinutesOfDay;
}

export const DayEdge = {
  WAKE_UP: 'wakeUp',
  BEDTIME: 'bedtime',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type DayEdge = (typeof DayEdge)[keyof typeof DayEdge];

export interface DayEdgeChange {
  edge: DayEdge;
  minute: number;
}

export const DEFAULT_DAY_EDGES: DayEdges = { wakeUp: 420, bedtime: 1380 };
/** Day edges move in steps of this many minutes. */
export const DAY_EDGE_STEP = 15;
/** The shortest day the edges allow: 6 hours. */
export const MIN_DAY_MINUTES = 360;

/** The edges after moving one of them: snapped to 15 minutes, inside 5:00 AM to midnight, and 6 hours from the other. */
export function withDayEdge(edges: DayEdges, { edge, minute }: DayEdgeChange): DayEdges {
  const snapped = Math.round(minute / DAY_EDGE_STEP) * DAY_EDGE_STEP;
  if (edge === DayEdge.WAKE_UP) {
    const max = Math.min(DAY_END, edges.bedtime) - MIN_DAY_MINUTES;
    return { ...edges, wakeUp: Math.min(max, Math.max(DAY_START, snapped)) };
  }
  const min = Math.max(DAY_START, edges.wakeUp) + MIN_DAY_MINUTES;
  return { ...edges, bedtime: Math.max(min, Math.min(DAY_END, snapped)) };
}

/** Whether stored edges follow the rules; anything else is treated as not set. */
export function isDayEdges({ wakeUp, bedtime }: DayEdges): boolean {
  const onGrid = (minute: number) => Number.isInteger(minute) && minute % DAY_EDGE_STEP === 0;
  return (
    onGrid(wakeUp) && onGrid(bedtime) && wakeUp >= DAY_START && bedtime <= DAY_END && bedtime - wakeUp >= MIN_DAY_MINUTES
  );
}
