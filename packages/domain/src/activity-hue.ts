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

/** A custom color as a lowercase 6-digit hex code, such as `#ea938b`. */
export type HexColor = `#${string}`;

/** What an activity is tinted with: a named hue, or a custom color the person picked. Stored in one field. */
export type ActivityColor = ActivityHue | HexColor;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: unknown): value is HexColor {
  return typeof value === 'string' && HEX_COLOR.test(value);
}

export function isActivityColor(value: unknown): value is ActivityColor {
  return isActivityHue(value) || isHexColor(value);
}

/** The hex code in the stored form (lowercase), or null when it is not a 6-digit hex code. */
export function toHexColor(value: string): HexColor | null {
  return isHexColor(value) ? (value.toLowerCase() as HexColor) : null;
}

const RECENT_CUSTOM_COLORS = 3;

/** The custom colors to offer as presets: the three most recent distinct ones, newest first (`used` is oldest first). */
export function recentCustomColors(used: readonly ActivityColor[]): HexColor[] {
  const recent: HexColor[] = [];
  for (let index = used.length - 1; index >= 0 && recent.length < RECENT_CUSTOM_COLORS; index--) {
    const color = used[index];
    if (isHexColor(color)) {
      const hex = toHexColor(color);
      if (hex && !recent.includes(hex)) recent.push(hex);
    }
  }
  return recent;
}
