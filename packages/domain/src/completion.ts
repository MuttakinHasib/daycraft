import type { Activity } from './activity';

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

/** Completed scheduled activities over all scheduled activities for the date, as the design counts them. Habit check-ins join this when habits land. */
export interface DailyProgress {
  done: number;
  total: number;
  /** 0–100, rounded. */
  percent: number;
}

/** Daily progress for the activities on one date. */
export function dailyProgress(activities: readonly Activity[]): DailyProgress {
  const scheduled = activities.filter((activity) => activity.start !== null);
  const total = scheduled.length;
  const done = scheduled.filter((activity) => activity.done).length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
