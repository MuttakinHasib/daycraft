export const FontWeight = {
  REGULAR: 400,
  MEDIUM: 500,
  SEMIBOLD: 600,
  BOLD: 700,
  EXTRABOLD: 800,
} as const;

export type FontWeight = (typeof FontWeight)[keyof typeof FontWeight];

/**
 * One Onest family per weight. On native each weight is its own embedded font (no synthetic bold),
 * so classes pick a family: `font-sans`, `font-sans-medium`, … `font-sans-extrabold`.
 */
export const fontFamilies: Record<FontWeight, { className: string; native: string }> = {
  400: { className: 'sans', native: 'Onest-Regular' },
  500: { className: 'sans-medium', native: 'Onest-Medium' },
  600: { className: 'sans-semibold', native: 'Onest-SemiBold' },
  700: { className: 'sans-bold', native: 'Onest-Bold' },
  800: { className: 'sans-extrabold', native: 'Onest-ExtraBold' },
};

export const TypePreset = {
  DISPLAY: 'display',
  DATE: 'date',
  TITLE: 'title',
  HEADING: 'heading',
  ACTIVITY: 'activity',
  BODY: 'body',
  BODY_SM: 'body-sm',
  CONTROL: 'control',
  META: 'meta',
  LABEL: 'label',
  MICRO: 'micro',
  CLOCK: 'clock',
} as const;

export type TypePreset = (typeof TypePreset)[keyof typeof TypePreset];

export interface TypeStyle {
  /** Font size in px. */
  size: number;
  /** Line height as a multiple of the size; omitted means the platform default. */
  lineHeight?: number;
  /** Letter spacing in em. */
  letterSpacing?: number;
  weight: FontWeight;
  use: string;
}

/** Design system v2 (canvas page "v3 · Clean") type scale. Each preset is a `type-*` class on both platforms. */
export const typeScale: Record<TypePreset, TypeStyle> = {
  display: { size: 30, lineHeight: 1.1, letterSpacing: -0.03, weight: 600, use: 'Screen titles' },
  date: { size: 27, lineHeight: 1.15, letterSpacing: -0.03, weight: 600, use: 'Plan date header' },
  title: { size: 24, lineHeight: 1.15, letterSpacing: -0.025, weight: 600, use: 'Secondary page titles (month, project)' },
  heading: { size: 20, lineHeight: 1.25, letterSpacing: -0.015, weight: 600, use: 'Sheet titles, empty states' },
  activity: { size: 16, lineHeight: 1.35, letterSpacing: -0.01, weight: 600, use: 'Activity titles' },
  body: { size: 15, lineHeight: 1.5, weight: 400, use: 'Body text' },
  'body-sm': { size: 14, lineHeight: 1.45, weight: 400, use: 'Subtitles, descriptions, notes' },
  control: { size: 13, weight: 500, use: 'Chips, segmented controls' },
  meta: { size: 12.5, lineHeight: 1.35, weight: 400, use: 'Times, durations' },
  label: { size: 12, letterSpacing: 0.06, weight: 600, use: 'Uppercase section labels' },
  micro: { size: 11, weight: 500, use: 'Timeline gutter, tab labels' },
  clock: { size: 56, letterSpacing: -0.03, weight: 500, use: 'Focus timer only' },
};

/** A one-line spec of a preset, e.g. `30px · 800 · lh 1.1 · -0.025em`. */
export function describeTypeStyle(preset: TypePreset): string {
  const style = typeScale[preset];
  const parts = [`${style.size}px`, `${style.weight}`];
  if (style.lineHeight !== undefined) parts.push(`lh ${style.lineHeight}`);
  if (style.letterSpacing !== undefined) parts.push(`${style.letterSpacing}em`);
  return parts.join(' · ');
}
