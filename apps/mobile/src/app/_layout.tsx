import { Stack, type NativeStackNavigationOptions } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaListener, SafeAreaProvider } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import { ToastProvider } from '@/components/ui';
import { MigrationsGate } from '@/data/migrations-gate';
import { AppTheme, useScreenStatusBarStyle } from '@/theme/app-theme';

import '@/global.css';

// The activity editor and detail open as native form sheets: they close on swipe down or a tap outside.
const ACTIVITY_SHEET: NativeStackNavigationOptions = {
  presentation: 'formSheet',
  sheetAllowedDetents: [0.94],
  sheetCornerRadius: 30,
  sheetGrabberVisible: false,
};

function RootStack() {
  const statusBarStyle = useScreenStatusBarStyle();
  return (
    <Stack screenOptions={{ headerShown: false, statusBarStyle }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="activity/new" options={ACTIVITY_SHEET} />
      <Stack.Screen name="activity/[id]/index" options={ACTIVITY_SHEET} />
      <Stack.Screen name="activity/[id]/edit" options={ACTIVITY_SHEET} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
          <AppTheme>
            <MigrationsGate>
              <ToastProvider>
                <RootStack />
              </ToastProvider>
            </MigrationsGate>
          </AppTheme>
        </SafeAreaListener>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
