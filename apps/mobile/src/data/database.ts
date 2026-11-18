import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

// The one database connection. Only files in src/data import it; screens use the activity store.

const sqlite = openDatabaseSync('daycraft.db');
sqlite.execSync('PRAGMA foreign_keys = ON;');

export const database = drizzle(sqlite, { schema });
