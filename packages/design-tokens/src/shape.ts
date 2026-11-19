export const Radius = {
  CHECK: 'check',
  TILE: 'tile',
  SEGMENT: 'segment',
  FIELD: 'field',
  CARD: 'card',
  CAPSULE: 'capsule',
  PANEL: 'panel',
  SHEET: 'sheet',
} as const;

export type Radius = (typeof Radius)[keyof typeof Radius];

/** Corner radii in px. Pills always use `rounded-full`, never a computed half-height. */
export const radii: Record<Radius, { px: number; use: string }> = {
  check: { px: 6, use: 'Checkbox squares, heat-map cells' },
  tile: { px: 12, use: 'Icon tiles, segmented track' },
  segment: { px: 9, use: 'Selected segment inside the segmented track (track radius minus its 3px padding)' },
  field: { px: 16, use: 'Inputs, list groups, agenda cards' },
  card: { px: 20, use: 'Cards, kanban columns' },
  capsule: { px: 24, use: 'Timeline capsule (48 wide)' },
  panel: { px: 24, use: 'Desktop panels' },
  sheet: { px: 30, use: 'Plan timeline panel and small sheets inside a sheet; native iOS sheets use the system corners' },
};

/** Elevation, used sparingly: tab bar, sheets, toast (float) and a dragged capsule (lift). */
export const shadows = {
  lift: '0 12px 28px rgba(0, 0, 0, 0.28)',
  /** The selected thumb on a sunken track (segmented controls); dark adds a top highlight. */
  thumb: {
    light: '0 1px 2px rgba(0, 0, 0, 0.14)',
    dark: 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 1px 2px rgba(0, 0, 0, 0.45)',
  },
} as const;

export function floatShadow(color: string): string {
  return `0 1px 2px ${color}, 0 12px 32px ${color}`;
}
