import { semanticColors, type SemanticColor } from '@daycraft/design-tokens';
import { ColorScheme, isThemePreference, ThemePreference } from '@daycraft/domain';
import { isRunningInExpoGo } from 'expo';
import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from 'expo-router';
import { Storage } from 'expo-sqlite/kv-store';
import { StatusBar } from 'expo-status-bar';
import { createContext, use, useLayoutEffect, useState, type ReactNode } from 'react';
import { Uniwind, useUniwind } from 'uniwind';

// Uniwind applies the saved preference to every className; code that cannot take a className
// reads the scheme and token values from here, never from React Native's useColorScheme.

const THEME_PREFERENCE_KEY = 'daycraft.theme-preference';

// Builds keep the SDK template's view-controller-based status bar (each screen sets its own);
// Expo Go hard-codes it off, so there the status bar is set app-wide instead.
const APP_WIDE_STATUS_BAR = isRunningInExpoGo();

interface ThemePreferenceState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

interface AppThemeProps {
  children: ReactNode;
}

const ThemePreferenceContext = createContext<ThemePreferenceState | null>(null);

function readStoredPreference(): ThemePreference {
  const stored = Storage.getItemSync(THEME_PREFERENCE_KEY);
  return isThemePreference(stored) ? stored : ThemePreference.SYSTEM;
}

export function useColorScheme(): ColorScheme {
  const { theme } = useUniwind();
  return theme === ColorScheme.DARK ? ColorScheme.DARK : ColorScheme.LIGHT;
}

/**
 * The Stack's `statusBarStyle` screen option for the current theme. Undefined in Expo Go, where
 * react-native-screens cannot set it and `AppTheme` renders an app-wide status bar instead.
 */
export function useScreenStatusBarStyle(): 'light' | 'dark' | undefined {
  const scheme = useColorScheme();
  if (APP_WIDE_STATUS_BAR) return undefined;
  return scheme === ColorScheme.DARK ? 'light' : 'dark';
}

/** Semantic token values for the current theme, for APIs that cannot take a className. */
export function useThemeColors(): Record<SemanticColor, string> {
  return semanticColors[useColorScheme()];
}

/** The saved theme preference and a setter that applies and stores it. */
export function useThemePreference(): ThemePreferenceState {
  const state = use(ThemePreferenceContext);
  if (!state) throw new Error('useThemePreference must be used inside <AppTheme>.');
  return state;
}

/** Wraps the app: applies the saved preference and themes navigation and the status bar. */
export function AppTheme({ children }: AppThemeProps) {
  const [preference, setStoredPreference] = useState(readStoredPreference);

  // Runs before paint, so a saved Light or Dark never shows the OS scheme first.
  useLayoutEffect(() => {
    Uniwind.setTheme(preference);
  }, [preference]);

  const setPreference = (next: ThemePreference) => {
    Storage.setItemSync(THEME_PREFERENCE_KEY, next);
    setStoredPreference(next);
  };

  const scheme = useColorScheme();
  const colors = semanticColors[scheme];
  const base = scheme === ColorScheme.DARK ? DarkTheme : DefaultTheme;
  const navigationTheme: Theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.canvas,
      card: colors.surface,
      text: colors.ink,
      border: colors.line,
      notification: colors.accent,
    },
  };

  return (
    <ThemePreferenceContext value={{ preference, setPreference }}>
      <ThemeProvider value={navigationTheme}>
        {APP_WIDE_STATUS_BAR && <StatusBar style={scheme === ColorScheme.DARK ? 'light' : 'dark'} />}
        {children}
      </ThemeProvider>
    </ThemePreferenceContext>
  );
}
