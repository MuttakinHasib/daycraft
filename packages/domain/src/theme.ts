/** The two color schemes every screen is designed for. */
export const ColorScheme = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type ColorScheme = (typeof ColorScheme)[keyof typeof ColorScheme];

/** The theme a person picks in Appearance. System follows the device. Kept per device, never synced. */
export const ThemePreference = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type ThemePreference = (typeof ThemePreference)[keyof typeof ThemePreference];

const themePreferences: ReadonlySet<unknown> = new Set(Object.values(ThemePreference));

export function isThemePreference(value: unknown): value is ThemePreference {
  return themePreferences.has(value);
}

/** The scheme to render: the picked one, or the device's when the preference is System. */
export function resolveColorScheme(preference: ThemePreference, systemScheme: ColorScheme): ColorScheme {
  if (preference === ThemePreference.SYSTEM) return systemScheme;
  return preference;
}
