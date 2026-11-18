import type { ActivityHue, ColorScheme } from '@daycraft/domain';

/** Colors that change with the theme. Used as `bg-canvas`, `text-ink-muted`, `border-line`, … */
export const SemanticColor = {
  CANVAS: 'canvas',
  SURFACE: 'surface',
  CARD: 'card',
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
  ON_HUE: 'on-hue',
  SUCCESS: 'success',
  DANGER: 'danger',
  SCRIM: 'scrim',
} as const;

export type SemanticColor = (typeof SemanticColor)[keyof typeof SemanticColor];

export const semanticColors: Record<ColorScheme, Record<SemanticColor, string>> = {
  light: {
    canvas: '#ffffff',
    surface: '#ffffff',
    card: '#f4f3f0',
    sunken: '#eeede9',
    elevated: '#ffffff',
    line: '#e9e7e2',
    'line-strong': '#d9d6cf',
    ink: '#1c1c1c',
    'ink-muted': '#5c5c5c',
    'ink-subtle': '#6b6b6b',
    accent: '#3366f0',
    'accent-hover': '#2a57d6',
    'accent-soft': '#e6edff',
    'accent-text': '#2f5fe0',
    'on-accent': '#ffffff',
    'on-hue': '#ffffff',
    success: '#1e8a5c',
    danger: '#d93d42',
    scrim: 'rgba(20, 20, 20, 0.36)',
  },
  dark: {
    canvas: '#111111',
    surface: '#171717',
    card: '#1f1f1f',
    sunken: '#292929',
    elevated: '#2a2a2a',
    line: '#2a2a2a',
    'line-strong': '#3b3b3b',
    ink: '#f4f4f2',
    'ink-muted': '#b4b4b4',
    'ink-subtle': '#8f8f8f',
    accent: '#3a6af2',
    'accent-hover': '#3060e0',
    'accent-soft': '#1d2a4d',
    'accent-text': '#8eaeff',
    'on-accent': '#ffffff',
    'on-hue': '#ffffff',
    success: '#4cc38a',
    danger: '#ff6b6e',
    scrim: 'rgba(0, 0, 0, 0.6)',
  },
};

/**
 * The nine activity hues: saturated and the same in both themes, each deep enough for white
 * `on-hue` icons and text at 3:1 or better (checked in the build). Capsules use the solid hue.
 */
export const hueColors: Record<ActivityHue, string> = {
  clay: '#ff541a',
  amber: '#cd7b00',
  sun: '#b28800',
  sage: '#39a25b',
  pine: '#2a9f8e',
  sky: '#4a7ff8',
  iris: '#987af5',
  rose: '#ff4a81',
  slate: '#8490a7',
};

/** Shares of an activity hue in its tints (the design system's "Hue tints" table). */
export const hueTints = {
  /** Habit circle not done: fill, and its dashed border. */
  habitCircle: 0.14,
  habitCircleBorder: 0.6,
  /** Event agenda card: fill and border. */
  agendaFill: 0.16,
  agendaBorder: 0.4,
  /** Ring around the active capsule. */
  activeRing: 0.28,
  /** Event card tint (agenda, Upcoming). */
  eventCard: 0.3,
  /** Mixed into `surface`: the part of an active capsule still ahead; the elapsed part is solid. */
  activeCapsuleBase: 0.42,
  /** Marker behind a highlighted headline word. */
  highlight: 0.42,
} as const;

/**
 * Detail and editor sheet header band: the hue mixed into `canvas`. Light keeps `ink` text on a
 * 40% tint; dark is the solid hue with `on-hue` text.
 */
export const sheetHeaderTint: Record<ColorScheme, number> = {
  light: 0.4,
  dark: 1,
};

/** Opacity of the `on-hue` bar in a capsule's resize grip. */
export const CAPSULE_GRIP_OPACITY = 0.75;

export const shadowColors: Record<ColorScheme, string> = {
  light: 'rgba(20, 20, 20, 0.08)',
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
