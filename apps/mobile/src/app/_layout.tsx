import { router, Stack, useRootNavigationState, type NativeStackNavigationOptions } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaListener, SafeAreaProvider } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import { ToastProvider } from '@/components/ui';
import { MigrationsGate } from '@/data/migrations-gate';
import {
  addFocusEndResponseListener,
  clearFocusEndLaunchResponse,
  focusEndLaunchResponse,
  focusEndRoute,
} from '@/features/focus/focus-notification';
import { recoverInterruptedSession } from '@/features/focus/running-session-store';
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

// Focus is full-screen, outside the tabs: the tab bar is hidden and × returns to Plan (navigation-and-modules).
const FOCUS_MODAL: NativeStackNavigationOptions = { presentation: 'fullScreenModal' };

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
  // A session the last closing interrupted is saved once per launch, silently, here at open — the
  // app opens on Plan, not on Focus. RootStack sits inside MigrationsGate, so the database is ready.
  // A launch from the end notification skips this save: the stored session is left for the Focus it
  // opens below, which recovers the record into its Done state instead of Plan's silence.
  const interruptedSessionRecovered = useRef(false);
  useEffect(() => {
    if (interruptedSessionRecovered.current) return;
    interruptedSessionRecovered.current = true;
    if (focusEndLaunchResponse() !== null) return;
    recoverInterruptedSession();
  }, []);
  // The end notification's tap returns to Focus at its Done state (the Focus slice's ticket 07):
  // the route the notification's activity names, whose screen recovers the stored session it left
  // above and opens on the record as Done. Expo Router's documented launch handling: consume the
  // response so a later navigation never routes the same tap twice.
  const endNotificationOpened = useRef(false);
  useEffect(() => {
    if (!navigationKey || endNotificationOpened.current) return;
    const response = focusEndLaunchResponse();
    if (response === null) return;
    endNotificationOpened.current = true;
    router.navigate(focusEndRoute(response));
    clearFocusEndLaunchResponse();
  }, [navigationKey]);
  // A tap while the app is already running — backgrounded for the session's end — does not relaunch
  // it, so the launch read above never sees it: the docs' response listener routes that tap, the
  // same focus route, and navigate keeps one Focus rather than stacking a second.
  useEffect(() => {
    if (!navigationKey) return;
    return addFocusEndResponseListener((response) => {
      router.navigate(focusEndRoute(response));
      clearFocusEndLaunchResponse();
    });
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
      <Stack.Screen name="goal/new" options={ACTIVITY_SHEET} />
      <Stack.Screen name="month-picker" options={monthPickerSheet} />
      <Stack.Screen name="focus/index" options={FOCUS_MODAL} />
      <Stack.Screen name="focus/[activityId]" options={FOCUS_MODAL} />
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
