import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { useCSSVariable, useUniwind } from 'uniwind';

/**
 * The one theme module. Uniwind decides light or dark (following the OS, or a theme set
 * through Uniwind.setTheme); everything that cannot take a className — the navigation
 * theme, the status bar, native APIs — reads the scheme and colors from here, never from
 * React Native's useColorScheme or hand-copied hex values.
 */

export const ColorScheme = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type ColorScheme = (typeof ColorScheme)[keyof typeof ColorScheme];

export interface ThemeColors {
  canvas: string;
  surface: string;
  sunken: string;
  elevated: string;
  line: string;
  ink: string;
  inkMuted: string;
  accent: string;
  onAccent: string;
}

interface AppThemeProps {
  children: ReactNode;
}

// Each variable must also be used by some className, or Uniwind cannot resolve it.
const COLOR_VARIABLES = [
  '--color-canvas',
  '--color-surface',
  '--color-sunken',
  '--color-elevated',
  '--color-line',
  '--color-ink',
  '--color-ink-muted',
  '--color-accent',
  '--color-on-accent',
] as const;

function toColor(value: string | number | undefined, variable: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Theme color ${variable} did not resolve. Use it in a className so Uniwind keeps it.`);
  }
  return value;
}

export function useColorScheme(): ColorScheme {
  const { theme } = useUniwind();
  return theme === ColorScheme.DARK ? ColorScheme.DARK : ColorScheme.LIGHT;
}

export function useThemeColors(): ThemeColors {
  const [canvas, surface, sunken, elevated, line, ink, inkMuted, accent, onAccent] =
    useCSSVariable([...COLOR_VARIABLES]);
  return {
    canvas: toColor(canvas, '--color-canvas'),
    surface: toColor(surface, '--color-surface'),
    sunken: toColor(sunken, '--color-sunken'),
    elevated: toColor(elevated, '--color-elevated'),
    line: toColor(line, '--color-line'),
    ink: toColor(ink, '--color-ink'),
    inkMuted: toColor(inkMuted, '--color-ink-muted'),
    accent: toColor(accent, '--color-accent'),
    onAccent: toColor(onAccent, '--color-on-accent'),
  };
}

/** Wraps the app: gives React Navigation and the status bar the Daycraft theme. */
export function AppTheme({ children }: AppThemeProps) {
  const scheme = useColorScheme();
  const colors = useThemeColors();
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
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={scheme === ColorScheme.DARK ? 'light' : 'dark'} />
      {children}
    </ThemeProvider>
  );
}
