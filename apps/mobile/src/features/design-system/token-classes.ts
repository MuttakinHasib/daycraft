import type { Radius, SemanticColor, TypePreset } from '@daycraft/design-tokens';

// Complete string literals only: Tailwind scans at build time, so no dynamic classes.

export const SemanticColorBackground: Record<SemanticColor, string> = {
  canvas: 'bg-canvas',
  surface: 'bg-surface',
  card: 'bg-card',
  sunken: 'bg-sunken',
  elevated: 'bg-elevated',
  raised: 'bg-raised',
  line: 'bg-line',
  'line-strong': 'bg-line-strong',
  ink: 'bg-ink',
  'ink-muted': 'bg-ink-muted',
  'ink-subtle': 'bg-ink-subtle',
  accent: 'bg-accent',
  'accent-hover': 'bg-accent-hover',
  'accent-soft': 'bg-accent-soft',
  'accent-text': 'bg-accent-text',
  'on-accent': 'bg-on-accent',
  'on-hue': 'bg-on-hue',
  success: 'bg-success',
  danger: 'bg-danger',
  scrim: 'bg-scrim',
};

export const TypePresetClass: Record<TypePreset, string> = {
  display: 'type-display',
  date: 'type-date',
  title: 'type-title',
  heading: 'type-heading',
  activity: 'type-activity',
  body: 'type-body',
  'body-sm': 'type-body-sm',
  control: 'type-control',
  meta: 'type-meta',
  label: 'type-label',
  micro: 'type-micro',
  clock: 'type-clock',
};

export const RadiusClass: Record<Radius, string> = {
  check: 'rounded-check',
  tile: 'rounded-tile',
  segment: 'rounded-segment',
  field: 'rounded-field',
  card: 'rounded-card',
  capsule: 'rounded-capsule',
  panel: 'rounded-panel',
  sheet: 'rounded-sheet',
};
