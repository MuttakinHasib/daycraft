import { Platform } from 'react-native';

// Legacy imperative colors for RN APIs that need raw values (nav chrome, native tab bar).
// The styling source of truth is the token set in src/global.css — these mirror it.
export const Colors = {
  light: {
    text: '#1B1916',
    background: '#F7F5F2',
    backgroundElement: '#EFECE7',
    backgroundSelected: '#FFFFFF',
    textSecondary: '#5F5953',
  },
  dark: {
    text: '#F2EFEA',
    background: '#121110',
    backgroundElement: '#262422',
    backgroundSelected: '#2C2A27',
    textSecondary: '#B3ADA5',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
