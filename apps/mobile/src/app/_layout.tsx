import { router, Stack, useRootNavigationState, type NativeStackNavigationOptions } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaListener, SafeAreaProvider } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import { ToastProvider } from '@/components/ui';
import { MigrationsGate } from '@/data/migrations-gate';
import { hasOnboarded } from '@/features/onboarding/onboarding-store';
import { AnimatedSplash } from '@/features/splash/animated-splash';
import { AppTheme, useScreenStatusBarStyle, useThemeColors } from '@/theme/app-theme';

import '@/global.css';

// The activity sheet opens as a native form sheet: it closes on swipe down or a tap outside.
const ACTIVITY_SHEET: NativeStackNavigationOptions = {
  presentation: 'formSheet',
  sheetAllowedDetents: [0.94],
  // No corner radius of our own: iOS rounds the sheet to match the screen's corners.
  sheetGrabberVisible: false,
};

function RootStack() {
  const statusBarStyle = useScreenStatusBarStyle();
  const navigationKey = useRootNavigationState()?.key;
  // The first launch opens onboarding under the splash, so it is there when the splash fades.
  // Opened once per launch: the navigation state can report ready more than once.
  const onboardingOpened = useRef(false);
  useEffect(() => {
    if (!navigationKey || onboardingOpened.current || hasOnboarded()) return;
    onboardingOpened.current = true;
    router.push('/onboarding');
  }, [navigationKey]);
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
      <Stack.Screen name="habit/new" options={ACTIVITY_SHEET} />
      <Stack.Screen name="month-picker" options={monthPickerSheet} />
      <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
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
