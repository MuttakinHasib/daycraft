import type { ColorScheme } from '@daycraft/domain';

import { SemanticColor } from './colors';

/**
 * Frosted glass for things that float over content (the phone tab bar and its + button). On iOS 26
 * the system's Liquid Glass replaces the pill; these values are the fallback and the web treatment.
 * The veil is mostly opaque so bright timeline colors can't smear through the bar.
 */
export const glass = {
  /** The semantic color laid over the blur, and how much of it. */
  veil: {
    light: { color: SemanticColor.SURFACE, opacity: 0.88 },
    dark: { color: SemanticColor.ELEVATED, opacity: 0.82 },
  },
  /** CSS: `backdrop-filter: blur(20px) saturate(160%)`. */
  blurPx: 20,
  saturate: 1.6,
  /** expo-blur's intensity (0–100) that matches the CSS blur on iOS. */
  nativeBlurIntensity: 80,
  /** 1px rim around the glass: a hairline in light so the bar separates from white screens. */
  edge: { light: 'rgba(28, 28, 28, 0.07)', dark: 'rgba(255, 255, 255, 0.09)' },
  /** 1px highlight along the top inner edge. */
  highlight: {
    light: 'rgba(255, 255, 255, 0.9)',
    dark: 'rgba(255, 255, 255, 0.1)',
  },
  shadow: {
    light: '0 1px 2px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 0, 0, 0.1)',
    dark: '0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.5)',
  },
  /** The quiet pill behind the selected tab (its icon and label turn `ink`). */
  selection: {
    light: 'rgba(28, 28, 28, 0.07)',
    dark: 'rgba(255, 255, 255, 0.11)',
  },
  /** The + beside the pill: a top inner highlight and an accent glow (the accent at this share). */
  plus: {
    highlight: 'rgba(255, 255, 255, 0.22)',
    glow: '0 6px 18px',
    glowOpacity: 0.38,
  },
  /** Height of the `canvas` fade behind the floating bar, from the screen's bottom edge; solid for its lower 30%. */
  fadeHeight: 128,
  fadeSolidStop: 0.3,
} as const satisfies {
  veil: Record<ColorScheme, { color: SemanticColor; opacity: number }>;
  blurPx: number;
  saturate: number;
  nativeBlurIntensity: number;
  edge: Record<ColorScheme, string>;
  highlight: Record<ColorScheme, string>;
  shadow: Record<ColorScheme, string>;
  selection: Record<ColorScheme, string>;
  plus: { highlight: string; glow: string; glowOpacity: number };
  fadeHeight: number;
  fadeSolidStop: number;
};
