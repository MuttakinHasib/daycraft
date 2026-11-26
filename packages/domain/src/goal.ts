import type { ActivityHue } from './activity-hue';
import type { ISODate } from './calendar';

/** A long-term direction made of milestones: never an activity and never on the timeline. */
export interface Goal {
  id: string;
  title: string;
  hue: ActivityHue;
  /** The local date the goal was created on. */
  createdDate: ISODate;
}

/** What creating a goal starts from: the sheet's fields. */
export interface GoalInput {
  title: string;
  hue: ActivityHue;
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
