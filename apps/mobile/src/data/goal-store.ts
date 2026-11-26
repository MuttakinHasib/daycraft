import { getRandomBytes } from 'expo-crypto';

import { uuidV7, type Goal } from '@daycraft/domain';

import { database } from './database';
import { createGoalRepository } from './goal-repository';
import { useLive } from './use-live';

/** The app's goal repository: every read and write of goals goes through it. */
export const goalRepository = createGoalRepository(database, {
  newId: () => uuidV7(getRandomBytes(10), Date.now()),
  now: () => new Date(),
});

/** Live goals in creation order. */
export function useGoals(): Goal[] {
  return useLive({ read: () => goalRepository.listLiveGoals(), key: 'goals', repository: goalRepository });
}
