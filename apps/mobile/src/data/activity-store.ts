import { getRandomBytes } from 'expo-crypto';
import { useEffect, useState } from 'react';

import { uuidV7, type Activity, type HexColor, type ISODate } from '@daycraft/domain';

import { createActivityRepository, type WeekDots } from './activity-repository';
import { database } from './database';
import { useLive } from './use-live';

/** The app's activity repository: every read and write of activities goes through it. */
export const activityRepository = createActivityRepository(database, {
  newId: () => uuidV7(getRandomBytes(10), Date.now()),
  now: () => new Date(),
});

/** The date's activities with their subtasks, in start order. */
export function useDayActivities(date: ISODate): Activity[] {
  return useLive({ read: () => activityRepository.readDay(date), key: date, repository: activityRepository });
}

/** Each date's hue dots for the week strip. */
export function useWeekDots(dates: ISODate[]): WeekDots {
  return useLive({
    read: () => activityRepository.readWeekDots(dates),
    key: dates.join(','),
    repository: activityRepository,
  });
}

/** The custom colors in use, oldest first. */
export function useUsedCustomColors(): HexColor[] {
  return useLive({
    read: () => activityRepository.readUsedCustomColors(),
    key: 'custom-colors',
    repository: activityRepository,
  });
}

/** One activity, or null once it is deleted; null while no activity is in focus. */
export function useActivity(id: string | null): Activity | null {
  return useLive({
    read: () => (id === null ? null : activityRepository.readActivity(id)),
    key: id ?? 'none',
    repository: activityRepository,
  });
}
