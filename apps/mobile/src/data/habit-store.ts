import { getRandomBytes } from 'expo-crypto';

import { uuidV7, type Habit, type ISODate } from '@daycraft/domain';

import { database } from './database';
import { createHabitRepository } from './habit-repository';
import { useLive } from './use-live';

/** The app's habit repository: every read and write of habits and check-ins goes through it. */
export const habitRepository = createHabitRepository(database, {
  newId: () => uuidV7(getRandomBytes(10), Date.now()),
  now: () => new Date(),
});

/** Live habits in creation order. */
export function useHabits(): Habit[] {
  return useLive({ read: () => habitRepository.listLiveHabits(), key: 'habits', repository: habitRepository });
}

/** The habits checked in on the date. */
export function useCheckedHabitIds(date: ISODate): string[] {
  return useLive({
    read: () => habitRepository.readCheckedHabitIds(date),
    key: `checked:${date}`,
    repository: habitRepository,
  });
}

/** One habit's check-in dates, for its streak. */
export function useCheckInDates(habitId: string): ISODate[] {
  return useLive({
    read: () => habitRepository.readCheckInDates(habitId),
    key: `check-ins:${habitId}`,
    repository: habitRepository,
  });
}

/**
 * Checks the habit in when it was not checked in, and unchecks it when it was, for one date.
 * Returns whether the habit is checked in after the toggle, for the caller's toast.
 */
export function toggleCheckIn(habitId: string, date: ISODate): boolean {
  const checked = habitRepository.readCheckedHabitIds(date).includes(habitId);
  if (checked) {
    habitRepository.uncheckIn(habitId, date);
    return false;
  }
  habitRepository.checkIn(habitId, date);
  return true;
}
