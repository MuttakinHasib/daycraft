import { getRandomBytes } from 'expo-crypto';

import { uuidV7 } from '@daycraft/domain';

import { database } from './database';
import { createFocusSessionRepository } from './focus-repository';

/** The app's focus session repository: every read and write of sessions goes through it. */
export const focusSessionRepository = createFocusSessionRepository(database, {
  newId: () => uuidV7(getRandomBytes(10), Date.now()),
  now: () => new Date(),
});
