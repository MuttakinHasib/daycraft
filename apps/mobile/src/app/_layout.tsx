import { Stack } from 'expo-router';
import { SafeAreaListener, SafeAreaProvider } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import { AppTheme, useStatusBarStyle } from '@/theme/app-theme';

import '@/global.css';

// Placeholder navigator until decision D1 (native tabs vs the custom Plan · Habits · + · Goals · More bar).
function RootStack() {
  const statusBarStyle = useStatusBarStyle();
  return <Stack screenOptions={{ headerShown: false, statusBarStyle }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
        <AppTheme>
          <RootStack />
        </AppTheme>
      </SafeAreaListener>
    </SafeAreaProvider>
  );
}
