import { ActivityHue, ColorScheme } from '@daycraft/domain';

import { hueColors, parseHexColor, semanticColors, type SemanticColor } from './colors';

export interface ContrastTokens {
  semantic: Record<ColorScheme, Record<SemanticColor, string>>;
  hues: Record<ActivityHue, string>;
}

export interface ContrastResult {
  pair: string;
  ratio: number;
  minimum: number;
  passes: boolean;
}

interface ContrastPair {
  pair: string;
  foreground: string;
  background: string;
  minimum: number;
}

const TEXT_MINIMUM = 4.5;
const ICON_MINIMUM = 3;

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const [r, g, b] = parseHexColor(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2 contrast ratio between two 6-digit hex colors (1 to 21). */
export function contrastRatio(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function pairsFor(tokens: ContrastTokens): ContrastPair[] {
  const pairs: ContrastPair[] = [];
  for (const scheme of Object.values(ColorScheme)) {
    const colors = tokens.semantic[scheme];
    pairs.push(
      { pair: `${scheme}: ink-subtle on canvas`, foreground: colors['ink-subtle'], background: colors.canvas, minimum: TEXT_MINIMUM },
      { pair: `${scheme}: ink-subtle on surface`, foreground: colors['ink-subtle'], background: colors.surface, minimum: TEXT_MINIMUM },
      { pair: `${scheme}: ink-subtle on card`, foreground: colors['ink-subtle'], background: colors.card, minimum: TEXT_MINIMUM },
      { pair: `${scheme}: on-accent on accent`, foreground: colors['on-accent'], background: colors.accent, minimum: TEXT_MINIMUM },
    );
  }
  for (const scheme of Object.values(ColorScheme)) {
    for (const hue of Object.values(ActivityHue)) {
      pairs.push({ pair: `${scheme}: on-hue icon on ${hue}`, foreground: tokens.semantic[scheme]['on-hue'], background: tokens.hues[hue], minimum: ICON_MINIMUM });
    }
  }
  return pairs;
}

/** Checks every contrast pair the design system promises. */
export function checkContrast(tokens: ContrastTokens = { semantic: semanticColors, hues: hueColors }): ContrastResult[] {
  return pairsFor(tokens).map(({ pair, foreground, background, minimum }) => {
    const ratio = contrastRatio(foreground, background);
    return { pair, ratio, minimum, passes: ratio >= minimum };
  });
}
