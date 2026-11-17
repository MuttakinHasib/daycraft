import type { ActivityHue } from '@daycraft/domain';

// Complete string literals only: Tailwind scans at build time, so no dynamic classes.
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

export const ActivityHueBorder: Record<ActivityHue, string> = {
  clay: 'border-clay',
  amber: 'border-amber',
  sun: 'border-sun',
  sage: 'border-sage',
  pine: 'border-pine',
  sky: 'border-sky',
  iris: 'border-iris',
  rose: 'border-rose',
  slate: 'border-slate',
};
