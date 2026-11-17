/** The nine hues an activity, habit, routine, goal or project can be tinted with. Stored and synced by name. */
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

export type ActivityHue = (typeof ActivityHue)[keyof typeof ActivityHue];

const activityHues: ReadonlySet<unknown> = new Set(Object.values(ActivityHue));

export function isActivityHue(value: unknown): value is ActivityHue {
  return activityHues.has(value);
}
