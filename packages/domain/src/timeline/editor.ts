import { ActivityKind, Priority, Repeat, type Activity, type ActivityInput } from '../activity';
import type { ISODate, MinutesOfDay } from '../calendar';
import { formatClock, formatRelativeDate } from './format';
import { clampToDay, DAY_END, DAY_START, MIN_DURATION } from './day-limits';

// Pure rules behind the activity editor: where a new activity goes, what it starts with, and what may be saved.

/** Where the editor was opened from; each entry point has its own defaults. */
export const EntryPoint = {
  /** The + beside the tab bar. */
  PLUS: 'plus',
  /** An empty half hour on the timeline. */
  SLOT: 'slot',
  /** The Add task chip in a free-time hint. */
  FREE_TIME: 'freeTime',
  /** **+ Plan this day** on an empty day. */
  PLAN_DAY: 'planDay',
} as const;

export type EntryPoint = (typeof EntryPoint)[keyof typeof EntryPoint];

/** Where the + looks from on a day that is not today: 9:00 AM. */
export const DEFAULT_START: MinutesOfDay = 540;
export const DEFAULT_DURATION = 30;
const SLOT_STEP = 15;
// A point-in-time activity still blocks this long when looking for a free slot.
const POINT_IN_TIME_BLOCK = 10;

export interface NextFreeSlotInput {
  activities: readonly Activity[];
  from: MinutesOfDay;
  durationMinutes: number;
}

/**
 * The first start at or after `from`, on the next 15-minute mark, that does not collide with a scheduled activity
 * (stepping to 5 minutes after one it would hit), kept within the day.
 */
export function nextFreeSlot({ activities, from, durationMinutes }: NextFreeSlotInput): MinutesOfDay {
  const scheduled = activities
    .filter((activity) => activity.start !== null)
    .sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
  let candidate = Math.max(DAY_START, Math.ceil(from / SLOT_STEP) * SLOT_STEP);
  for (const activity of scheduled) {
    const start = activity.start ?? 0;
    const end = start + (activity.durationMinutes || POINT_IN_TIME_BLOCK);
    if (candidate + durationMinutes <= start) break;
    if (candidate < end) candidate = Math.ceil(end / 5) * 5;
  }
  return Math.min(candidate, DAY_END - durationMinutes);
}

export interface EditorDefaultsInput {
  entry: EntryPoint;
  date: ISODate;
  today: ISODate;
  now: MinutesOfDay;
  /** The date's activities, for finding a free slot. */
  activities: readonly Activity[];
  /** The tapped slot's start, or the free-time gap's start. */
  start?: MinutesOfDay;
  /** The free-time gap's duration. */
  durationMinutes?: number;
}

/** The pre-filled values for a new task from each entry point. */
export function editorDefaults(input: EditorDefaultsInput): ActivityInput {
  const { entry, date, today, now, activities } = input;
  const durationMinutes =
    entry === EntryPoint.FREE_TIME && input.durationMinutes !== undefined ? input.durationMinutes : DEFAULT_DURATION;
  const fromSlot = (entry === EntryPoint.SLOT || entry === EntryPoint.FREE_TIME) && input.start !== undefined;
  const start = fromSlot
    ? (input.start ?? DEFAULT_START)
    : nextFreeSlot({ activities, from: date === today ? now : DEFAULT_START, durationMinutes });
  const timing = clampToDay({ start, durationMinutes });
  return {
    date,
    start: timing.start,
    durationMinutes: timing.durationMinutes,
    title: '',
    hue: 'clay',
    icon: 'check',
    kind: ActivityKind.TASK,
    done: false,
    notes: '',
    subtasks: [],
    repeat: Repeat.NEVER,
    priority: Priority.NONE,
    labels: [],
    location: '',
    projectId: null,
  };
}

/** Why an activity can't be saved. */
export const ValidationReason = {
  MISSING_TITLE: 'missingTitle',
  EVENT_NEEDS_START: 'eventNeedsStart',
  OUTSIDE_DAY: 'outsideDay',
} as const;

export type ValidationReason = (typeof ValidationReason)[keyof typeof ValidationReason];

export type ValidationResult = { ok: true; value: ActivityInput } | { ok: false; reason: ValidationReason };

/** The toast for each reason an activity can't be saved. */
export const VALIDATION_MESSAGES: Record<ValidationReason, string> = {
  missingTitle: 'Give it a name first',
  eventNeedsStart: 'An event needs a time',
  outsideDay: 'Keep it between 5:00 AM and midnight',
};

/** Checks an activity before saving: a title is required, events need a start, and the day limits hold. */
export function validateActivity(draft: ActivityInput): ValidationResult {
  const title = draft.title.trim();
  if (title === '') return { ok: false, reason: ValidationReason.MISSING_TITLE };
  if (draft.kind === ActivityKind.EVENT && draft.start === null) {
    return { ok: false, reason: ValidationReason.EVENT_NEEDS_START };
  }
  if (draft.start !== null) {
    const clamped = clampToDay({ start: draft.start, durationMinutes: draft.durationMinutes });
    if (clamped.start !== draft.start || clamped.durationMinutes !== draft.durationMinutes) {
      return { ok: false, reason: ValidationReason.OUTSIDE_DAY };
    }
  } else if (draft.durationMinutes < MIN_DURATION) {
    return { ok: false, reason: ValidationReason.OUTSIDE_DAY };
  }
  const subtasks = draft.subtasks
    .map((subtask) => ({ ...subtask, title: subtask.title.trim() }))
    .filter((subtask) => subtask.title !== '');
  return { ok: true, value: { ...draft, title, subtasks, location: draft.location.trim() } };
}

export interface SavedToastInput {
  activity: Pick<Activity, 'kind' | 'date' | 'start'>;
  today: ISODate;
  created: boolean;
}

/** "Task added · Today, 10:45 AM", "Event added · Tomorrow, 2:00 PM" or "Saved · Today, no set time". */
export function savedToast({ activity, today, created }: SavedToastInput): string {
  let verb = 'Saved';
  if (created) verb = activity.kind === ActivityKind.EVENT ? 'Event added' : 'Task added';
  const when = activity.start === null ? 'no set time' : formatClock(activity.start);
  return `${verb} · ${formatRelativeDate(activity.date, today)}, ${when}`;
}

// Completion and subtask ticks save at once, so they never count as unsaved changes.
function editableFields({ done: _done, subtasks, ...fields }: ActivityInput) {
  return { ...fields, subtasks: subtasks.map(({ id, title }) => ({ id, title })) };
}

/** Whether the activity sheet holds changes that Save would write. */
export function draftChanged(saved: ActivityInput, draft: ActivityInput): boolean {
  return JSON.stringify(editableFields(saved)) !== JSON.stringify(editableFields(draft));
}

/** A new activity copied from `activity`, starting when it ends, not done, with unticked subtasks of its own. */
export function duplicateDraft(activity: Activity): ActivityInput {
  const { id: _id, subtasks, ...fields } = activity;
  const timing =
    activity.start === null
      ? { start: null, durationMinutes: activity.durationMinutes }
      : clampToDay({ start: activity.start + activity.durationMinutes, durationMinutes: activity.durationMinutes });
  return {
    ...fields,
    ...timing,
    done: false,
    subtasks: subtasks.map(({ title }) => ({ title, done: false })),
  };
}

/** A minute of day on a 12-hour clock, as the time wheel shows it. */
export interface ClockParts {
  /** 1–12. */
  hour: number;
  minute: number;
  pm: boolean;
}

export function clockParts(minuteOfDay: MinutesOfDay): ClockParts {
  const hour24 = Math.floor(minuteOfDay / 60);
  return { hour: hour24 % 12 || 12, minute: minuteOfDay % 60, pm: hour24 >= 12 };
}

export function fromClockParts({ hour, minute, pm }: ClockParts): MinutesOfDay {
  return ((hour % 12) + (pm ? 12 : 0)) * 60 + minute;
}
