import { getRandomBytes } from 'expo-crypto';
import { useEffect, useEffectEvent, useState } from 'react';

import { uuidV7, type Activity, type DayEdges, type ISODate } from '@daycraft/domain';

import { createActivityRepository, type WeekDots } from './activity-repository';
import { database } from './database';

/** The app's activity repository: every read and write of activities goes through it. */
export const activityRepository = createActivityRepository(database, {
  newId: () => uuidV7(getRandomBytes(10), Date.now()),
  now: () => new Date(),
});

interface LiveValue<T> {
  key: string;
  value: T;
}

// Reads now, and again after every write through the repository. `key` names what `read` depends on.
function useLive<T>(read: () => T, key: string): T {
  const [live, setLive] = useState<LiveValue<T>>(() => ({ key, value: read() }));
  const refresh = useEffectEvent(() => setLive({ key, value: read() }));
  useEffect(() => activityRepository.subscribe(refresh), []);
  if (live.key !== key) {
    const next = { key, value: read() };
    setLive(next);
    return next.value;
  }
  return live.value;
}

/** The date's activities with their subtasks, in start order. */
export function useDayActivities(date: ISODate): Activity[] {
  return useLive(() => activityRepository.readDay(date), date);
}

/** Each date's hue dots for the week strip. */
export function useWeekDots(dates: ISODate[]): WeekDots {
  return useLive(() => activityRepository.readWeekDots(dates), dates.join(','));
}

/** One activity, or null once it is deleted. */
export function useActivity(id: string): Activity | null {
  return useLive(() => activityRepository.readActivity(id), id);
}

/** The saved day edges, or null until the person sets them. */
export function useDayEdges(): DayEdges | null {
  return useLive(() => activityRepository.readDayEdges(), 'day-edges');
}
