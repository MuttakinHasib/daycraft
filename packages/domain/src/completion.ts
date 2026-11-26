import type { Activity } from './activity';
import type { Habit } from './habit';

/**
 * The activity after its check ring is tapped. Completing it completes every subtask;
 * uncompleting it leaves the subtasks as they are, so their progress is kept.
 */
export function completionToggled(activity: Activity): Activity {
  const done = !activity.done;
  return {
    ...activity,
    done,
    subtasks: done ? activity.subtasks.map((subtask) => ({ ...subtask, done: true })) : activity.subtasks,
  };
}

/** Completed scheduled activities plus checked-in habits over all of them for the date, as the design counts them. */
export interface DailyProgress {
  done: number;
  total: number;
  /** 0–100, rounded. */
  percent: number;
}

/** The habits that existed on the date, and which of them are checked in (one rule for both numbers). */
export interface DailyProgressHabits {
  habits: readonly Habit[];
  checkedIds: readonly string[];
}

export function dailyProgress(activities: readonly Activity[], { habits, checkedIds }: DailyProgressHabits): DailyProgress {
  const scheduled = activities.filter((activity) => activity.start !== null);
  const total = scheduled.length + habits.length;
  const done = scheduled.filter((activity) => activity.done).length + checkedIds.filter((id) => habits.some((habit) => habit.id === id)).length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
