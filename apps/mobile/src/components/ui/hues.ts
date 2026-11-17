import type { ActivityHue } from '@daycraft/domain';

// Complete string literals only — Tailwind scans at build time, so no dynamic classes.
export const ActivityHueBackground: Record<ActivityHue, string> = {
  clay: 'bg-clay',
  amber: 'bg-amber',
  sun: 'bg-sun',
  sage: 'bg-sage',
  pine: 'bg-pine',
  sky: 'bg-sky',
  iris: 'bg-iris',
  rose: 'bg-rose',
  slate: 'bg-slate',
};
