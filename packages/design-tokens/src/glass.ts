import type { ColorScheme } from '@daycraft/domain';

/**
 * Frosted glass for things that float over content (the phone tab bar). On iOS 26 the system's
 * Liquid Glass replaces it; these values are the fallback and the web treatment.
 */
export const glass = {
  /** Share of `elevated` laid over the blur. */
  veil: 0.58,
  /** CSS: `backdrop-filter: blur(22px) saturate(180%)`. */
  blurPx: 22,
  saturate: 1.8,
  /** expo-blur's intensity (0–100) that matches the CSS blur on iOS. */
  nativeBlurIntensity: 80,
  /** 1px rim around the glass. */
  edge: { light: 'rgba(255, 255, 255, 0.7)', dark: 'rgba(255, 255, 255, 0.1)' },
  /** 1px highlight along the top inner edge. */
  highlight: { light: 'rgba(255, 255, 255, 0.85)', dark: 'rgba(255, 255, 255, 0.14)' },
  shadow: { light: '0 10px 30px rgba(0, 0, 0, 0.1)', dark: '0 10px 30px rgba(0, 0, 0, 0.45)' },
} as const satisfies {
  veil: number;
  blurPx: number;
  saturate: number;
  nativeBlurIntensity: number;
  edge: Record<ColorScheme, string>;
  highlight: Record<ColorScheme, string>;
  shadow: Record<ColorScheme, string>;
};
