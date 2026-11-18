import type { Activity } from '../activity';
import type { ActivityHue } from '../activity-hue';
import type { MinutesOfDay } from '../calendar';
import { DAY_END, DAY_START, type Timing } from './day-limits';

// The Plan timeline's layout (timeline guide §3–§9): proportional to time, with rows pushed down so they never
// overlap, and an anchored time map so hour labels, slots and the now line follow the pushed-down rows.

/** Points per minute on the phone. */
export const PHONE_SCALE = 1.1;

const TOP_PADDING = 18;
const ROW_GAP = 12;
const MIN_CAPSULE = 48;
const META_ROW_HEIGHT = 80;
const BOTTOM_PADDING = 150;
const DASHED_GAP_MINUTES = 45;
const FREE_TIME_MINUTES = 60;
const FREE_TIME_MIN_HEIGHT = 76;
const SLOT_MINUTES = 30;
const MIN_SLOT_HEIGHT = 14;
const FIRST_HOUR = 5;
const LAST_HOUR = 23;
const START_LABEL_OFFSET = 10;
const START_LABEL_NOW_CLEARANCE = 16;
const HOUR_NOW_CLEARANCE = 18;

export const RowState = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  DONE: 'done',
} as const;

export type RowState = (typeof RowState)[keyof typeof RowState];

export const SpineKind = {
  /** A gap under 45 minutes: a gradient from one hue to the next. */
  GRADIENT: 'gradient',
  /** A gap of 45 minutes or more: dashed. */
  DASHED: 'dashed',
} as const;

export type SpineKind = (typeof SpineKind)[keyof typeof SpineKind];

export interface TimelineRow {
  activity: Activity;
  top: number;
  capsuleHeight: number;
  rowHeight: number;
  state: RowState;
  /** For an active row, how much of it has passed (0–1). */
  elapsed: number;
  /** For an active row, the minutes until it ends. */
  minutesLeft: number;
  /** Whether the row has a meta line (subtasks, an event's location, or the Now tag). */
  hasMeta: boolean;
  /** False when the start label would collide with the now line. */
  showStartLabel: boolean;
}

export interface SpineSegment {
  top: number;
  height: number;
  kind: SpineKind;
  fromHue: ActivityHue;
  toHue: ActivityHue;
  /** Both neighbors are done. */
  dimmed: boolean;
}

export interface FreeTimeHint {
  top: number;
  /** Minutes of free time, or minutes left when now is inside the gap. */
  minutes: number;
  next: Activity;
  nowInside: boolean;
  /** Where Add task starts: the gap start, or the next 15-minute mark after now. */
  addStart: MinutesOfDay;
  /** The gap rounded down to 15 minutes, within 15–60. */
  addDuration: number;
}

export interface HourLabel {
  hour: number;
  y: number;
}

export interface SlotTarget {
  start: MinutesOfDay;
  top: number;
  height: number;
}

export interface Anchor {
  minute: MinutesOfDay;
  y: number;
}

export interface DayLayout {
  rows: TimelineRow[];
  anchors: Anchor[];
  contentHeight: number;
  hours: HourLabel[];
  spine: SpineSegment[];
  freeTime: FreeTimeHint[];
  slots: SlotTarget[];
  /** The now line's y on today, else null. */
  nowY: number | null;
}

/** A drag in progress: this activity is laid out with the preview timing. */
export interface DragPreview extends Timing {
  id: string;
}

export interface LayoutDayInput {
  activities: readonly Activity[];
  scale: number;
  isToday: boolean;
  now: MinutesOfDay;
  preview?: DragPreview | null;
}

/** Interpolates a minute to a y position between the anchors. */
export function mapTimeToY(anchors: readonly Anchor[], minute: MinutesOfDay): number {
  for (let index = 0; index < anchors.length - 1; index++) {
    const a = anchors[index];
    const b = anchors[index + 1];
    if (!a || !b) continue;
    if (minute >= a.minute && minute <= b.minute) {
      if (b.minute === a.minute) return a.y;
      return a.y + ((minute - a.minute) / (b.minute - a.minute)) * (b.y - a.y);
    }
  }
  return anchors[anchors.length - 1]?.y ?? TOP_PADDING;
}

function scheduled(input: LayoutDayInput): (Activity & { start: MinutesOfDay })[] {
  const { preview } = input;
  return input.activities
    .filter((activity): activity is Activity & { start: MinutesOfDay } => activity.start !== null)
    .map((activity) =>
      preview && preview.id === activity.id
        ? { ...activity, start: preview.start, durationMinutes: preview.durationMinutes }
        : activity,
    )
    .sort((a, b) => a.start - b.start || a.durationMinutes - b.durationMinutes);
}

/** Lays out one date of the timeline. The screen renders this output and holds no layout logic of its own. */
export function layoutDay(input: LayoutDayInput): DayLayout {
  const { scale, isToday, now } = input;
  const rows: TimelineRow[] = [];
  let offset = 0;
  let previousBottom = -Infinity;

  for (const activity of scheduled(input)) {
    const duration = activity.durationMinutes;
    const capsuleHeight = duration > 0 ? Math.max(MIN_CAPSULE, duration * scale) : MIN_CAPSULE;
    const active = isToday && !activity.done && duration > 0 && now >= activity.start && now < activity.start + duration;
    const hasMeta = activity.subtasks.length > 0 || activity.kind === 'event' || active;
    const rowHeight = Math.max(capsuleHeight, hasMeta ? META_ROW_HEIGHT : MIN_CAPSULE);
    let top = (activity.start - DAY_START) * scale + TOP_PADDING + offset;
    if (top < previousBottom + ROW_GAP) {
      offset += previousBottom + ROW_GAP - top;
      top = previousBottom + ROW_GAP;
    }
    rows.push({
      activity,
      top,
      capsuleHeight,
      rowHeight,
      state: activity.done ? RowState.DONE : active ? RowState.ACTIVE : RowState.UPCOMING,
      elapsed: active ? (now - activity.start) / duration : 0,
      minutesLeft: active ? activity.start + duration - now : 0,
      hasMeta,
      showStartLabel: true,
    });
    previousBottom = top + rowHeight;
  }

  const anchors: Anchor[] = [{ minute: DAY_START, y: TOP_PADDING }];
  const push = (minute: number, y: number) => {
    const last = anchors[anchors.length - 1] ?? { minute: DAY_START, y: TOP_PADDING };
    anchors.push({ minute: Math.max(minute, last.minute), y: Math.max(y, last.y) });
  };
  for (const row of rows) {
    const start = row.activity.start ?? DAY_START;
    const { durationMinutes } = row.activity;
    if (durationMinutes > 0) {
      push(start, row.top);
      push(start + durationMinutes, row.top + row.capsuleHeight);
    } else {
      push(start, row.top + row.capsuleHeight / 2);
    }
  }
  const last = anchors[anchors.length - 1] ?? { minute: DAY_START, y: TOP_PADDING };
  const endY = last.y + Math.max(0, DAY_END - last.minute) * scale;
  anchors.push({ minute: DAY_END, y: endY });

  const map = (minute: number) => mapTimeToY(anchors, minute);
  const nowY = isToday ? map(now) : null;

  if (nowY !== null) {
    for (const row of rows) {
      row.showStartLabel = Math.abs(nowY - (row.top + START_LABEL_OFFSET)) >= START_LABEL_NOW_CLEARANCE;
    }
  }

  const spine: SpineSegment[] = [];
  const freeTime: FreeTimeHint[] = [];
  for (let index = 0; index < rows.length - 1; index++) {
    const a = rows[index];
    const b = rows[index + 1];
    if (!a || !b) continue;
    const aStart = a.activity.start ?? DAY_START;
    const bStart = b.activity.start ?? DAY_START;
    const aEnd = aStart + a.activity.durationMinutes;
    const gapMinutes = bStart - aEnd;
    const capsuleBottom = a.top + a.capsuleHeight;
    if (b.top > capsuleBottom) {
      spine.push({
        top: capsuleBottom,
        height: b.top - capsuleBottom,
        kind: gapMinutes >= DASHED_GAP_MINUTES ? SpineKind.DASHED : SpineKind.GRADIENT,
        fromHue: a.activity.hue,
        toHue: b.activity.hue,
        dimmed: a.activity.done && b.activity.done,
      });
    }

    const rowBottom = a.top + a.rowHeight;
    const gapHeight = b.top - rowBottom;
    if (gapMinutes >= FREE_TIME_MINUTES && gapHeight >= FREE_TIME_MIN_HEIGHT && (!isToday || bStart > now)) {
      const nowInside = isToday && now >= aEnd && now < bStart;
      const addStart = nowInside ? Math.ceil(now / 15) * 15 : Math.ceil(aEnd / 5) * 5;
      freeTime.push({
        top: nowInside && nowY !== null ? Math.min(nowY + 16, b.top - 70) : rowBottom + gapHeight / 2 - 32,
        minutes: bStart - (nowInside ? now : aEnd),
        next: b.activity,
        nowInside,
        addStart,
        addDuration: Math.min(60, Math.max(15, Math.floor((bStart - addStart) / 15) * 15)),
      });
    }
  }

  const slots: SlotTarget[] = [];
  for (let start = DAY_START; start < DAY_END; start += SLOT_MINUTES) {
    const top = map(start);
    const height = map(start + SLOT_MINUTES) - top;
    if (height >= MIN_SLOT_HEIGHT) slots.push({ start, top, height });
  }

  const hours: HourLabel[] = [];
  for (let hour = FIRST_HOUR; hour <= LAST_HOUR; hour++) {
    const y = map(hour * 60);
    const nearRow = rows.some((row) => y >= row.top - ROW_GAP && y <= row.top + row.rowHeight + 6);
    const nearNow = nowY !== null && Math.abs(y - nowY) < HOUR_NOW_CLEARANCE;
    if (!nearRow && !nearNow) hours.push({ hour, y });
  }

  return {
    rows,
    anchors,
    contentHeight: Math.max(endY, previousBottom) + BOTTOM_PADDING,
    hours,
    spine,
    freeTime,
    slots,
    nowY,
  };
}
