import { contrastRatio, hexFromHsv, hsvFromHex, hueColors, inkOn, semanticColors } from '@daycraft/design-tokens';
import { isActivityHue, type ActivityColor } from '@daycraft/domain';

/** The color to paint: a named hue's token value, or the custom hex code as picked. */
export function colorValue(color: ActivityColor): string {
  return isActivityHue(color) ? hueColors[color] : color;
}

/** The ink for icons and text on the color: white, or dark on a light custom color in both themes. */
export function inkClassOn(color: ActivityColor): string {
  // `ink` turns light in dark mode, so dark mode takes `canvas` (near black) for the same dark ink.
  return inkOn(colorValue(color)) === 'ink' ? 'text-ink dark:text-canvas' : 'text-on-hue';
}

/** The text on the sheet's header band: ink over the light tint, and in dark over the solid color. */
export function bandTextOn(color: ActivityColor): string {
  return inkOn(colorValue(color)) === 'ink' ? 'text-ink dark:text-canvas' : 'text-ink dark:text-on-hue';
}

// Lines and icons in the color sit on light surfaces; below this they fade into them.
const STROKE_MINIMUM = 3;

/** The color for lines and icons drawn in it on a light surface: a pale custom color is darkened until it reads. */
export function strokeColor(color: ActivityColor): string {
  const value = colorValue(color);
  const surface = semanticColors.light.card;
  if (contrastRatio(value, surface) >= STROKE_MINIMUM) return value;
  const hsv = hsvFromHex(value);
  let shade = value;
  for (let v = hsv.v; v > 0 && contrastRatio(shade, surface) < STROKE_MINIMUM; v -= 0.05) {
    shade = hexFromHsv({ h: hsv.h, s: Math.max(hsv.s, 0.6), v });
  }
  return shade;
}
