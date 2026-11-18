import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import migrations from '../../drizzle/migrations';
import { database } from './database';

interface MigrationsGateProps {
  children: ReactNode;
}

// Keeps the splash screen up until the database is migrated.
void SplashScreen.preventAutoHideAsync();

/** Renders the app once the database schema is current. */
export function MigrationsGate({ children }: MigrationsGateProps) {
  const { success, error } = useMigrations(database, migrations);

  useEffect(() => {
    if (success || error) SplashScreen.hide();
  }, [success, error]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-2 bg-canvas px-8">
        <Text className="type-heading text-ink">Daycraft could not open your data</Text>
        <Text className="type-body-sm text-center text-ink-muted">{error.message}</Text>
      </View>
    );
  }
  if (!success) return null;
  return children;
}
