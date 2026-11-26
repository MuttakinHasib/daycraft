import type { ActivityHue } from './activity-hue';
import { daysBetween, type ISODate } from './calendar';
import { formatShortDateWithYear } from './timeline/format';

/** A completion marker on a goal (glossary): no dates in v1, only a done flag. */
export interface Milestone {
  id: string;
  title: string;
  done: boolean;
}

/** What creating a milestone starts from: the sheet's composer row before it has an id. */
export interface MilestoneInput {
  title: string;
}

/** What editing a goal's milestones may change: a kept id keeps its done flag, an absent id is a new one. */
export interface MilestoneChange {
  id?: string;
  title: string;
}

/** A long-term direction made of milestones: never an activity and never on the timeline. */
export interface Goal {
  id: string;
  title: string;
  /** What the goal is working toward, in the author's words; null when it has none. */
  description: string | null;
  /** The date the goal should be reached by (glossary), or null when it has none. */
  targetDate: ISODate | null;
  hue: ActivityHue;
  /** The local date the goal was created on. */
  createdDate: ISODate;
  /** The goal's milestones in the order they were added. */
  milestones: Milestone[];
}

/** What creating a goal starts from: the sheet's fields. */
export interface GoalInput {
  title: string;
  /** Optional: a goal without one shows no description. */
  description?: string;
  /** Optional: a goal without one shows no target line. */
  targetDate?: ISODate;
  hue: ActivityHue;
  milestones: MilestoneInput[];
}

/** What editing a goal may change; `targetDate: null` clears the target date, `description: null` the
 * description, and `milestones` replaces the list in its given order (kept ids keep their done flag). */
export interface GoalChanges {
  title?: string;
  description?: string | null;
  hue?: ActivityHue;
  targetDate?: ISODate | null;
  milestones?: MilestoneChange[];
}

/** The message when the sheet tries to save a goal with no usable title. Mirrors HABIT_NAME_MESSAGE. */
export const GOAL_NAME_MESSAGE = 'Name your goal first';

/** The sheet's title rule: a title with no characters that are not spaces is not a title. */
export function validateGoalName(title: string): string | null {
  return title.trim() === '' ? GOAL_NAME_MESSAGE : null;
}

/** Done milestones ÷ all milestones, rounded to a whole percent; 0 when there are no milestones. */
export function goalProgress(milestones: readonly Milestone[]): number {
  if (milestones.length === 0) return 0;
  const done = milestones.filter((milestone) => milestone.done).length;
  return Math.round((done / milestones.length) * 100);
}

/**
 * The goal card's target line: `Target Sun, Dec 20, 2026 · 33 days left` before the date, `· N days past`
 * after it (today counts as zero days left), and nothing without a target date.
 */
export function targetLine(targetDate: ISODate | null, today: ISODate): string | null {
  if (targetDate === null) return null;
  const days = daysBetween(today, targetDate);
  const distance = days >= 0 ? `${days} days left` : `${-days} days past`;
  return `Target ${formatShortDateWithYear(targetDate)} · ${distance}`;
}
