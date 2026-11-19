import type { ActivityColor } from './activity-hue';
import type { ISODate, MinutesOfDay } from './calendar';
import type { IconName } from './icon-name';

/** What an activity is: a task can be completed and unscheduled, an event is a fixed commitment, a routine is a set of steps. */
export const ActivityKind = {
  TASK: 'task',
  EVENT: 'event',
  ROUTINE: 'routine',
} as const;

export type ActivityKind = (typeof ActivityKind)[keyof typeof ActivityKind];

/** A task's importance. High shows a flag on the timeline. */
export const Priority = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type Priority = (typeof Priority)[keyof typeof Priority];

/** An activity's recurrence preset (ADR-0006). Stored now, expanded in a later slice. */
export const Repeat = {
  NEVER: 'never',
  DAILY: 'daily',
  /** Kept for activities saved before Monthly; no longer offered. */
  WEEKDAYS: 'weekdays',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const;

export type Repeat = (typeof Repeat)[keyof typeof Repeat];

/** The fixed set of labels an activity can carry. Stored by these names. */
export const Label = {
  WORK: 'Work',
  PERSONAL: 'Personal',
  HEALTH: 'Health',
  ERRAND: 'Errand',
  LEARNING: 'Learning',
} as const;

export type Label = (typeof Label)[keyof typeof Label];

const activityKinds: ReadonlySet<unknown> = new Set(Object.values(ActivityKind));
const priorities: ReadonlySet<unknown> = new Set(Object.values(Priority));
const repeats: ReadonlySet<unknown> = new Set(Object.values(Repeat));
const labels: ReadonlySet<unknown> = new Set(Object.values(Label));

export function isActivityKind(value: unknown): value is ActivityKind {
  return activityKinds.has(value);
}

export function isPriority(value: unknown): value is Priority {
  return priorities.has(value);
}

export function isRepeat(value: unknown): value is Repeat {
  return repeats.has(value);
}

export function isLabel(value: unknown): value is Label {
  return labels.has(value);
}

/** A checklist line inside an activity. */
export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

/** Anything placed on a day: a task, an event or a routine instance. */
export interface Activity {
  id: string;
  date: ISODate;
  /** Null for an unscheduled task ("Anytime"). Events always have a start. */
  start: MinutesOfDay | null;
  /** 0 for a point in time, drawn as a circle. */
  durationMinutes: number;
  title: string;
  /** A named hue or a custom hex color. */
  hue: ActivityColor;
  icon: IconName;
  kind: ActivityKind;
  done: boolean;
  notes: string;
  subtasks: Subtask[];
  repeat: Repeat;
  priority: Priority;
  labels: Label[];
  location: string;
  projectId: string | null;
}

/** A subtask as written by the editor: an existing one keeps its id, a new one has none yet. */
export interface SubtaskInput {
  id?: string;
  title: string;
  done: boolean;
}

/** Everything needed to create an activity. The store assigns the id. */
export type ActivityInput = Omit<Activity, 'id' | 'subtasks'> & { subtasks: SubtaskInput[] };

/** The fields an edit may change. Subtasks, when given, replace the whole list. */
export type ActivityChanges = Partial<ActivityInput>;
