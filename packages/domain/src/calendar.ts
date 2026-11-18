/**
 * A calendar date in the person's local time zone, written 'YYYY-MM-DD'. It is never parsed as UTC:
 * every conversion below builds a local `Date` from the year, month and day parts.
 */
export type ISODate = string & { readonly __brand: 'ISODate' };

/** Minutes since local midnight (0–1439), as floating wall-clock time with no time zone. */
export type MinutesOfDay = number;

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const MS_PER_DAY = 86_400_000;

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function parts(date: ISODate): [year: number, monthIndex: number, day: number] {
  const match = ISO_DATE_PATTERN.exec(date);
  if (!match) throw new Error(`Not an ISO date: ${date}`);
  return [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
}

/** True for a real 'YYYY-MM-DD' date (so '2026-02-30' is rejected). */
export function isISODate(value: unknown): value is ISODate {
  if (typeof value !== 'string') return false;
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return toISODate(date) === value;
}

/** The local calendar date of a `Date`. */
export function toISODate(date: Date): ISODate {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}` as ISODate;
}

/** Local midnight of the date. */
export function fromISODate(date: ISODate): Date {
  const [year, monthIndex, day] = parts(date);
  return new Date(year, monthIndex, day);
}

/** Today's date from a supplied clock reading. */
export function todayISO(now: Date): ISODate {
  return toISODate(now);
}

/** Local wall-clock minutes of a clock reading. */
export function minutesOfDay(now: Date): MinutesOfDay {
  return now.getHours() * 60 + now.getMinutes();
}

/** The date `days` later (or earlier when negative). Steps calendar days, so daylight-saving changes never skip or repeat a date. */
export function addDays(date: ISODate, days: number): ISODate {
  const [year, monthIndex, day] = parts(date);
  return toISODate(new Date(year, monthIndex, day + days));
}

/** Whole calendar days from `from` to `to`. */
export function daysBetween(from: ISODate, to: ISODate): number {
  const [y1, m1, d1] = parts(from);
  const [y2, m2, d2] = parts(to);
  return Math.round((Date.UTC(y2, m2, d2) - Date.UTC(y1, m1, d1)) / MS_PER_DAY);
}

/** 0 for Sunday through 6 for Saturday. */
export function weekdayOf(date: ISODate): number {
  const [year, monthIndex, day] = parts(date);
  return new Date(Date.UTC(year, monthIndex, day)).getUTCDay();
}

/** The seven dates of the Sunday-to-Saturday week that holds `date`. */
export function weekOf(date: ISODate): ISODate[] {
  const sunday = addDays(date, -weekdayOf(date));
  return Array.from({ length: 7 }, (_, index) => addDays(sunday, index));
}

/** The calendar year, month (1–12) and day of a date. */
export function datePartsOf(date: ISODate): { year: number; month: number; day: number } {
  const [year, monthIndex, day] = parts(date);
  return { year, month: monthIndex + 1, day };
}
