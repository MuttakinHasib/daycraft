import { addDays, type ISODate, weekdayOf } from './calendar';
import type { ActivityHue } from './activity-hue';
import type { IconName } from './icon-name';
import { DAYCRAFT_NAMESPACE, uuidV5 } from './ids';

/** How often a habit wants a check-in: every day, or a Target of days per week. */
export const HabitFrequency = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
} as const;

export type HabitFrequency = (typeof HabitFrequency)[keyof typeof HabitFrequency];

/** A recurring behavior with a check-in per date, never an activity and never on the timeline. */
export interface Habit {
  id: string;
  name: string;
  icon: IconName;
  hue: ActivityHue;
  frequency: HabitFrequency;
  /** The weekly Target: 1–7 when weekly, null when daily. */
  target: number | null;
  /** The local date the habit was created on; nothing before it counts. */
  createdDate: ISODate;
  /** The local date the habit was deleted on (soft delete); check-ins before it are kept. */
  deletedDate: ISODate | null;
}

/** What creating a habit starts from: the sheet's fields. */
export interface HabitInput {
  name: string;
  icon: IconName;
  hue: ActivityHue;
  frequency: HabitFrequency;
  target: number | null;
}

/** The message when the sheet tries to save a habit with no usable name (the prototype's toast). */
export const HABIT_NAME_MESSAGE = 'Name your habit first';

/** The sheet's name rule: a name with no characters that are not spaces is not a name. */
export function validateHabitName(name: string): string | null {
  return name.trim() === '' ? HABIT_NAME_MESSAGE : null;
}

/** One rule for the row, the progress total and the streak: created on or before the date, deleted after it. */
export function habitExistsOn(habit: Habit, date: ISODate): boolean {
  return habit.createdDate <= date && (habit.deletedDate === null || date < habit.deletedDate);
}

/** The check-in's id: the same habit and date always give the same id (ADR-0007). */
export function checkInId(habitId: string, date: ISODate): string {
  return uuidV5(DAYCRAFT_NAMESPACE, `check-in:${habitId}:${date}`);
}

/** What a streak counts back from. */
export interface StreakInput {
  today: ISODate;
}

/**
 * Consecutive checked days ending today (or yesterday when today is not checked in yet), stopping at the first
 * missed day or the day before the habit existed. The current day never breaks it.
 */
export function dailyStreak(habit: Habit, checkIns: readonly ISODate[], { today }: StreakInput): number {
  const checked = new Set(checkIns);
  let date = checked.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (habitExistsOn(habit, date) && checked.has(date)) {
    streak += 1;
    date = addDays(date, -1);
  }
  return streak;
}

/**
 * Consecutive completed weeks (Sunday to Saturday) that met the Target, counted back from last week. The
 * current week neither adds nor breaks, the creation week counts against the full Target, and the weeks before
 * the habit existed are skipped instead of breaking it.
 */
export function weeklyStreak(habit: Habit, checkIns: readonly ISODate[], { today }: StreakInput): number {
  const target = habit.target ?? 0;
  const checked = new Set(checkIns);
  let weekStart = addDays(today, -weekdayOf(today) - 7); // Last week's Sunday.
  let streak = 0;
  while (true) {
    const weekEnd = addDays(weekStart, 6);
    if (weekEnd < habit.createdDate) break; // The habit did not exist in or before this week.
    let met = 0;
    for (let day = 0; day < 7; day += 1) {
      if (checked.has(addDays(weekStart, day))) met += 1;
    }
    if (met < target) break;
    streak += 1;
    weekStart = addDays(weekStart, -7);
  }
  return streak;
}

/** This week's check-ins up to today, the true count even past the Target ("5 of 4"). */
export function weeklyCount(habit: Habit, checkIns: readonly ISODate[], { today }: StreakInput): number {
  const weekStart = addDays(today, -weekdayOf(today));
  return checkIns.filter((date) => date >= weekStart && date <= today && date >= habit.createdDate).length;
}
