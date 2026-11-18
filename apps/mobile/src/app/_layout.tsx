import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaListener, SafeAreaProvider } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import { MigrationsGate } from '@/data/migrations-gate';
import { AppTheme, useScreenStatusBarStyle } from '@/theme/app-theme';

import '@/global.css';

function RootStack() {
  const statusBarStyle = useScreenStatusBarStyle();
  return <Stack screenOptions={{ headerShown: false, statusBarStyle }} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
          <AppTheme>
            <MigrationsGate>
              <RootStack />
            </MigrationsGate>
          </AppTheme>
        </SafeAreaListener>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
