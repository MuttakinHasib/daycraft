import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import migrations from '../../drizzle/migrations';
import { database } from './database';

interface MigrationsGateProps {
  children: ReactNode;
  /** Called once the database is migrated or has failed; the launch animation waits for it. */
  onSettled?: () => void;
}

/** Renders the app once the database schema is current. */
export function MigrationsGate({ children, onSettled }: MigrationsGateProps) {
  const { success, error } = useMigrations(database, migrations);

  useEffect(() => {
    if (success || error) onSettled?.();
  }, [success, error, onSettled]);

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
