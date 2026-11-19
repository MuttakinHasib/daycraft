import { radii } from '@daycraft/design-tokens';
import { Stack, type NativeStackNavigationOptions } from 'expo-router';
import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaListener, SafeAreaProvider } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import { ToastProvider } from '@/components/ui';
import { MigrationsGate } from '@/data/migrations-gate';
import { AnimatedSplash } from '@/features/splash/animated-splash';
import { AppTheme, useScreenStatusBarStyle, useThemeColors } from '@/theme/app-theme';

import '@/global.css';

// The activity editor and detail open as native form sheets: they close on swipe down or a tap outside.
const ACTIVITY_SHEET: NativeStackNavigationOptions = {
  presentation: 'formSheet',
  sheetAllowedDetents: [0.94],
  sheetCornerRadius: radii.sheet.px,
  sheetGrabberVisible: false,
};

function RootStack() {
  const statusBarStyle = useScreenStatusBarStyle();
  const colors = useThemeColors();
  // The month picker sizes to its grid; the sheet's own background fills the space under it.
  const monthPickerSheet: NativeStackNavigationOptions = {
    ...ACTIVITY_SHEET,
    sheetAllowedDetents: 'fitToContents',
    contentStyle: { backgroundColor: colors.surface },
  };
  return (
    <Stack screenOptions={{ headerShown: false, statusBarStyle }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="activity/new" options={ACTIVITY_SHEET} />
      <Stack.Screen name="activity/[id]/index" options={ACTIVITY_SHEET} />
      <Stack.Screen name="activity/[id]/edit" options={ACTIVITY_SHEET} />
      <Stack.Screen name="month-picker" options={monthPickerSheet} />
    </Stack>
  );
}

export default function RootLayout() {
  const [dataReady, setDataReady] = useState(false);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
          <AppTheme>
            <MigrationsGate onSettled={() => setDataReady(true)}>
              <ToastProvider>
                <RootStack />
              </ToastProvider>
            </MigrationsGate>
            <AnimatedSplash ready={dataReady} />
          </AppTheme>
        </SafeAreaListener>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
