import type { ActivityHue } from './activity-hue';
import { daysBetween, type ISODate } from './calendar';
import { formatShortDateWithYear } from './timeline/format';

/** A long-term direction made of milestones: never an activity and never on the timeline. */
export interface Goal {
  id: string;
  title: string;
  /** The date the goal should be reached by (glossary), or null when it has none. */
  targetDate: ISODate | null;
  hue: ActivityHue;
  /** The local date the goal was created on. */
  createdDate: ISODate;
}

/** What creating a goal starts from: the sheet's fields. */
export interface GoalInput {
  title: string;
  /** Optional: a goal without one shows no target line. */
  targetDate?: ISODate;
  hue: ActivityHue;
}

/** What editing a goal may change; `targetDate: null` clears the target date. */
export interface GoalChanges {
  targetDate?: ISODate | null;
}

/** The message when the sheet tries to save a goal with no usable title. Mirrors HABIT_NAME_MESSAGE. */
export const GOAL_NAME_MESSAGE = 'Name your goal first';

/** The sheet's title rule: a title with no characters that are not spaces is not a title. */
export function validateGoalName(title: string): string | null {
  return title.trim() === '' ? GOAL_NAME_MESSAGE : null;
}

/** Done milestones ÷ all milestones, rounded to a whole percent; 0 when there are no milestones. */
export function goalProgress(milestones: readonly { done: boolean }[]): number {
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
