export const ActivityHue = {
  CLAY: 'clay',
  AMBER: 'amber',
  SUN: 'sun',
  SAGE: 'sage',
  PINE: 'pine',
  SKY: 'sky',
  IRIS: 'iris',
  ROSE: 'rose',
  SLATE: 'slate',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type ActivityHue = (typeof ActivityHue)[keyof typeof ActivityHue];

// Complete string literals only — Tailwind scans at build time, so no dynamic classes.
export const ActivityHueBackground: Record<ActivityHue, string> = {
  clay: 'bg-clay',
  amber: 'bg-amber',
  sun: 'bg-sun',
  sage: 'bg-sage',
  pine: 'bg-pine',
  sky: 'bg-sky',
  iris: 'bg-iris',
  rose: 'bg-rose',
  slate: 'bg-slate',
};
