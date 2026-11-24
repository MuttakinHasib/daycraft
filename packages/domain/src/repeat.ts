import { Repeat, type ActivityInput } from './activity';
import { addDays, datePartsOf, daysBetween, weekdayOf, type ISODate } from './calendar';
import { DAYCRAFT_NAMESPACE, uuidV5 } from './ids';

// Repeating activities (ADR-0006): a series holds a small RRULE subset, and each date it falls on gets an
// ordinary activity row (an occurrence) whose id comes from the series and the date.

const WEEKDAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;
type WeekdayCode = (typeof WEEKDAY_CODES)[number];
const WORKDAYS: readonly WeekdayCode[] = ['MO', 'TU', 'WE', 'TH', 'FR'];

export const RepeatFrequency = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type RepeatFrequency = (typeof RepeatFrequency)[keyof typeof RepeatFrequency];

/** The RRULE subset Daycraft stores: FREQ, INTERVAL, BYDAY and BYMONTHDAY. */
export interface RepeatRule {
  freq: RepeatFrequency;
  interval: number;
  /** Weekdays for WEEKLY, Sunday first as RRULE codes. */
  byDay: WeekdayCode[];
  /** The day of the month for MONTHLY. */
  byMonthDay: number | null;
}

/** Where a change to a repeating activity goes. */
export const EditScope = {
  /** This date only: the occurrence is detached from its series. */
  THIS: 'this',
  /** This date and every later one. */
  FUTURE: 'future',
  /** Every date of the series. */
  ALL: 'all',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type EditScope = (typeof EditScope)[keyof typeof EditScope];

export interface OccurrenceRange {
  rule: RepeatRule;
  /** The series' first date. */
  start: ISODate;
  /** The series' last date, or null when it runs on. */
  until: ISODate | null;
  from: ISODate;
  to: ISODate;
}

/** The rule for a Repeat preset, anchored on the series' first date; null for a one-off activity. */
export function ruleFor(repeat: Repeat, start: ISODate): RepeatRule | null {
  switch (repeat) {
    case Repeat.DAILY:
      return { freq: RepeatFrequency.DAILY, interval: 1, byDay: [], byMonthDay: null };
    case Repeat.WEEKDAYS:
      return { freq: RepeatFrequency.WEEKLY, interval: 1, byDay: [...WORKDAYS], byMonthDay: null };
    case Repeat.WEEKLY:
      return {
        freq: RepeatFrequency.WEEKLY,
        interval: 1,
        byDay: [WEEKDAY_CODES[weekdayOf(start)] ?? 'MO'],
        byMonthDay: null,
      };
    case Repeat.MONTHLY:
      return { freq: RepeatFrequency.MONTHLY, interval: 1, byDay: [], byMonthDay: datePartsOf(start).day };
    default:
      return null;
  }
}

export function formatRule({ freq, interval, byDay, byMonthDay }: RepeatRule): string {
  const parts = [`FREQ=${freq}`, `INTERVAL=${interval}`];
  if (byDay.length > 0) parts.push(`BYDAY=${byDay.join(',')}`);
  if (byMonthDay !== null) parts.push(`BYMONTHDAY=${byMonthDay}`);
  return parts.join(';');
}

/** Reads a stored rule; anything outside the subset is null. */
export function parseRule(text: string): RepeatRule | null {
  const fields = new Map(
    text.split(';').map((part) => {
      const [key = '', value = ''] = part.split('=');
      return [key.trim().toUpperCase(), value.trim().toUpperCase()] as const;
    }),
  );
  const freq = fields.get('FREQ');
  if (freq !== RepeatFrequency.DAILY && freq !== RepeatFrequency.WEEKLY && freq !== RepeatFrequency.MONTHLY) {
    return null;
  }
  const interval = Number(fields.get('INTERVAL') ?? '1');
  if (!Number.isInteger(interval) || interval < 1) return null;
  const byDayText = fields.get('BYDAY');
  const byDay = byDayText ? byDayText.split(',') : [];
  if (!byDay.every((code): code is WeekdayCode => (WEEKDAY_CODES as readonly string[]).includes(code))) return null;
  const monthDayText = fields.get('BYMONTHDAY');
  const byMonthDay = monthDayText === undefined ? null : Number(monthDayText);
  if (byMonthDay !== null && (!Number.isInteger(byMonthDay) || byMonthDay < 1 || byMonthDay > 31)) return null;
  if (freq === RepeatFrequency.WEEKLY && byDay.length === 0) return null;
  if (freq === RepeatFrequency.MONTHLY && byMonthDay === null) return null;
  return { freq, interval, byDay, byMonthDay };
}

/** The Repeat preset a rule shows as. */
export function repeatOf(rule: RepeatRule): Repeat {
  if (rule.freq === RepeatFrequency.DAILY) return Repeat.DAILY;
  if (rule.freq === RepeatFrequency.MONTHLY) return Repeat.MONTHLY;
  const workdays = rule.byDay.length === WORKDAYS.length && WORKDAYS.every((code) => rule.byDay.includes(code));
  return workdays ? Repeat.WEEKDAYS : Repeat.WEEKLY;
}

function monthsBetween(from: ISODate, to: ISODate): number {
  const a = datePartsOf(from);
  const b = datePartsOf(to);
  return (b.year - a.year) * 12 + (b.month - a.month);
}

function occursOn(rule: RepeatRule, start: ISODate, date: ISODate): boolean {
  const days = daysBetween(start, date);
  if (days < 0) return false;
  switch (rule.freq) {
    case RepeatFrequency.DAILY:
      return days % rule.interval === 0;
    case RepeatFrequency.WEEKLY: {
      const code = WEEKDAY_CODES[weekdayOf(date)];
      const weeks = Math.floor((days + weekdayOf(start)) / 7);
      return code !== undefined && rule.byDay.includes(code) && weeks % rule.interval === 0;
    }
    case RepeatFrequency.MONTHLY:
      return datePartsOf(date).day === rule.byMonthDay && monthsBetween(start, date) % rule.interval === 0;
    default:
      return false;
  }
}

/** The dates from `from` to `to` (both included) that the series falls on. */
export function occurrenceDates({ rule, start, until, from, to }: OccurrenceRange): ISODate[] {
  const first = daysBetween(from, start) > 0 ? start : from;
  const last = until !== null && daysBetween(until, to) > 0 ? until : to;
  const found: ISODate[] = [];
  for (let date = first; daysBetween(date, last) >= 0; date = addDays(date, 1)) {
    if (occursOn(rule, start, date)) found.push(date);
  }
  return found;
}

/** The occurrence's id: the same series and date always give the same id, so no date is created twice. */
export function occurrenceId(seriesId: string, date: ISODate): string {
  return uuidV5(DAYCRAFT_NAMESPACE, `occurrence:${seriesId}:${date}`);
}

// What every occurrence of a series shares; a change to any of these asks where it goes.
const TEMPLATE_FIELDS = ['title', 'start', 'durationMinutes', 'hue', 'icon', 'kind', 'repeat'] as const;

/** Whether a change touches what the series' occurrences share (and so needs a scope). */
export function templateChanged(saved: ActivityInput, draft: ActivityInput): boolean {
  return TEMPLATE_FIELDS.some((field) => saved[field] !== draft[field]);
}

/** One line on what changed, for the scope question: "Start time moved", "Title and colour changed". */
export function changeSummary(saved: ActivityInput, draft: ActivityInput): string {
  if (saved.repeat !== draft.repeat) return draft.repeat === Repeat.NEVER ? 'Repeat turned off' : 'Repeat changed';
  const timeMoved = saved.start !== draft.start;
  const lengthChanged = saved.durationMinutes !== draft.durationMinutes;
  if (
    timeMoved &&
    !lengthChanged &&
    TEMPLATE_FIELDS.every((field) => field === 'start' || saved[field] === draft[field])
  ) {
    return 'Start time moved';
  }
  const names: string[] = [];
  if (timeMoved || lengthChanged) names.push('time');
  if (saved.title !== draft.title) names.push('title');
  if (saved.hue !== draft.hue) names.push('colour');
  if (saved.icon !== draft.icon) names.push('icon');
  if (saved.kind !== draft.kind) names.push('type');
  if (names.length === 0) return 'Changes';
  const joined = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
  return `${joined!.charAt(0).toUpperCase()}${joined!.slice(1)} changed`;
}
