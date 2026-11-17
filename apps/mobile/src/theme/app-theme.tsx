import { semanticColors, type SemanticColor } from '@daycraft/design-tokens';
import { ColorScheme, isThemePreference, ThemePreference } from '@daycraft/domain';
import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from 'expo-router';
import { Storage } from 'expo-sqlite/kv-store';
import { createContext, use, useLayoutEffect, useState, type ReactNode } from 'react';
import { Uniwind, useUniwind } from 'uniwind';

// Uniwind applies the saved preference to every className; code that cannot take a className
// reads the scheme and token values from here, never from React Native's useColorScheme.

const THEME_PREFERENCE_KEY = 'daycraft.theme-preference';

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
 * Status bar content for the current theme. iOS gives each native-stack screen its own status
 * bar (view-controller based), so pass this as the Stack's `statusBarStyle` screen option.
 */
export function useStatusBarStyle(): 'light' | 'dark' {
  return useColorScheme() === ColorScheme.DARK ? 'light' : 'dark';
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

/** Wraps the app: applies the saved preference and gives navigation the theme. */
export function AppTheme({ children }: AppThemeProps) {
  const [preference, setStoredPreference] = useState(readStoredPreference);

  // Before paint, so a saved Light or Dark never flashes the OS scheme first.
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
      <ThemeProvider value={navigationTheme}>{children}</ThemeProvider>
    </ThemePreferenceContext>
  );
}
