import type { IconName } from '@daycraft/domain';

/** Icons Lucide has no same-meaning glyph for, drawn from the design prototype (ADR-0002). */
export type CustomIconName = Extract<IconName, 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'run' | 'timeline'>;

type GlyphShape =
  | { kind: 'path'; d: string }
  | { kind: 'circle'; cx: number; cy: number; r: number };

const face = { kind: 'circle', cx: 12, cy: 12, r: 9.5 } as const;

/** 24×24 outline glyphs, drawn with round caps and joins at the shared stroke width. */
export const customGlyphs: Record<CustomIconName, GlyphShape[]> = {
  m1: [face, { kind: 'path', d: 'M9 10h.01M15 10h.01M8 17c1-1.5 2.5-2.2 4-2.2s3 .7 4 2.2' }],
  m2: [face, { kind: 'path', d: 'M9 10h.01M15 10h.01M8.5 16.2c1-.7 2.2-1 3.5-1s2.5.3 3.5 1' }],
  m3: [face, { kind: 'path', d: 'M9 10h.01M15 10h.01M8.5 15.5h7' }],
  m4: [face, { kind: 'path', d: 'M9 10h.01M15 10h.01M8.5 14.5c1 1 2.2 1.5 3.5 1.5s2.5-.5 3.5-1.5' }],
  m5: [face, { kind: 'path', d: 'M9 9.5h.01M15 9.5h.01M7.5 13.5c1 2.2 2.6 3.3 4.5 3.3s3.5-1.1 4.5-3.3z' }],
  run: [
    { kind: 'circle', cx: 15, cy: 4.5, r: 2 },
    { kind: 'path', d: 'M5 21l4-6 3 2 1 4M9 15l2-5-3 1-2 3M11 10l4-1 2 3h3' },
  ],
  timeline: [
    { kind: 'circle', cx: 6, cy: 6, r: 2.6 },
    { kind: 'circle', cx: 6, cy: 18, r: 2.6 },
    { kind: 'path', d: 'M6 8.6v6.8M11.5 6h9M11.5 18h9M11.5 11h5.5' },
  ],
};

export function isCustomIcon(name: IconName): name is CustomIconName {
  return name in customGlyphs;
}

/** The design's stroke width for every icon (the check inside a check ring uses 3.2). */
export const ICON_STROKE_WIDTH = 1.9;
