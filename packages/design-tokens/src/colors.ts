import type { ActivityHue, ColorScheme } from '@daycraft/domain';

/** Colors that change with the theme. Used as `bg-canvas`, `text-ink-muted`, `border-line`, … */
export const SemanticColor = {
  CANVAS: 'canvas',
  SURFACE: 'surface',
  SUNKEN: 'sunken',
  ELEVATED: 'elevated',
  LINE: 'line',
  LINE_STRONG: 'line-strong',
  INK: 'ink',
  INK_MUTED: 'ink-muted',
  INK_SUBTLE: 'ink-subtle',
  ACCENT: 'accent',
  ACCENT_HOVER: 'accent-hover',
  ACCENT_SOFT: 'accent-soft',
  ACCENT_TEXT: 'accent-text',
  ON_ACCENT: 'on-accent',
  SUCCESS: 'success',
  DANGER: 'danger',
  SCRIM: 'scrim',
} as const;

export type SemanticColor = (typeof SemanticColor)[keyof typeof SemanticColor];

export const semanticColors: Record<ColorScheme, Record<SemanticColor, string>> = {
  light: {
    canvas: '#f7f5f2',
    surface: '#ffffff',
    sunken: '#efece7',
    elevated: '#ffffff',
    line: '#e6e1da',
    'line-strong': '#d5cec4',
    ink: '#1b1916',
    'ink-muted': '#5f5953',
    'ink-subtle': '#716b64',
    accent: '#ad5236',
    'accent-hover': '#97462d',
    'accent-soft': '#f6e4db',
    'accent-text': '#ad5236',
    'on-accent': '#ffffff',
    success: '#3c7d61',
    danger: '#b4473f',
    scrim: 'rgba(27, 25, 22, 0.34)',
  },
  dark: {
    canvas: '#121110',
    surface: '#1b1a18',
    sunken: '#262422',
    elevated: '#312e2b',
    line: '#2f2d2a',
    'line-strong': '#45413c',
    ink: '#f2efea',
    'ink-muted': '#b3ada5',
    'ink-subtle': '#9a948c',
    accent: '#e4815d',
    'accent-hover': '#ec9475',
    'accent-soft': '#3a251c',
    'accent-text': '#ee936f',
    'on-accent': '#241109',
    success: '#5fb08a',
    danger: '#e0796f',
    scrim: 'rgba(0, 0, 0, 0.58)',
  },
};

/** The nine activity hues. The same in both themes; white icons and bold text sit on them. */
export const hueColors: Record<ActivityHue, string> = {
  clay: '#c8694a',
  amber: '#c47a34',
  sun: '#b08a2a',
  sage: '#5e9154',
  pine: '#3c7d61',
  sky: '#4f86c0',
  iris: '#7569c4',
  rose: '#c25e78',
  slate: '#66707f',
};

export const shadowColors: Record<ColorScheme, string> = {
  light: 'rgba(27, 25, 22, 0.1)',
  dark: 'rgba(0, 0, 0, 0.5)',
};

/** Red, green and blue (0–255) of a 6-digit hex color. */
export function parseHexColor(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(value)) {
    throw new Error(`Expected a 6-digit hex color, got "${hex}"`);
  }
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
}

/** Mixes a hex color with transparency, for the documented hue tints (14%, 28%, 42%, …). */
export function withOpacity(hex: string, opacity: number): string {
  const [r, g, b] = parseHexColor(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
