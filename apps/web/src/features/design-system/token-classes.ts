import type { Radius, TypePreset } from "@daycraft/design-tokens";
import type { ActivityHue } from "@daycraft/domain";

// Write each class as a complete string. Tailwind finds classes by scanning the source at build
// time, so it misses class names built at runtime.

export const HueBackground: Record<ActivityHue, string> = {
  clay: "bg-clay",
  amber: "bg-amber",
  sun: "bg-sun",
  sage: "bg-sage",
  pine: "bg-pine",
  sky: "bg-sky",
  iris: "bg-iris",
  rose: "bg-rose",
  slate: "bg-slate",
};

export const HueBorder: Record<ActivityHue, string> = {
  clay: "border-clay",
  amber: "border-amber",
  sun: "border-sun",
  sage: "border-sage",
  pine: "border-pine",
  sky: "border-sky",
  iris: "border-iris",
  rose: "border-rose",
  slate: "border-slate",
};

export const TypePresetClass: Record<TypePreset, string> = {
  display: "type-display",
  date: "type-date",
  title: "type-title",
  heading: "type-heading",
  activity: "type-activity",
  body: "type-body",
  "body-sm": "type-body-sm",
  control: "type-control",
  meta: "type-meta",
  label: "type-label",
  micro: "type-micro",
  clock: "type-clock",
};

export const RadiusClass: Record<Radius, string> = {
  check: "rounded-check",
  tile: "rounded-tile",
  segment: "rounded-segment",
  field: "rounded-field",
  card: "rounded-card",
  capsule: "rounded-capsule",
  panel: "rounded-panel",
  sheet: "rounded-sheet",
};
