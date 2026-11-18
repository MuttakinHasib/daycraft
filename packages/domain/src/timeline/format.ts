import { daysBetween, fromISODate, type ISODate, type MinutesOfDay } from '../calendar';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function hourOf(minute: MinutesOfDay): number {
  return Math.floor(minute / 60) % 24;
}

function meridiem(minute: MinutesOfDay): 'AM' | 'PM' {
  return hourOf(minute) < 12 ? 'AM' : 'PM';
}

/** `9:30`, with no AM/PM: the timeline gutter's start label. */
export function formatGutterTime(minute: MinutesOfDay): string {
  return `${hourOf(minute) % 12 || 12}:${String(minute % 60).padStart(2, '0')}`;
}

/** `9:30 AM`. */
export function formatClock(minute: MinutesOfDay): string {
  return `${formatGutterTime(minute)} ${meridiem(minute)}`;
}

/** `9 AM`: an hour label on the timeline. */
export function formatHour(hour: number): string {
  return `${hour % 12 || 12} ${hour % 24 < 12 ? 'AM' : 'PM'}`;
}

/** `9:30–11:30 AM`, sharing the suffix when both ends are on the same side of noon; just the time for a point in time. */
export function formatRange(start: MinutesOfDay, durationMinutes: number): string {
  if (durationMinutes === 0) return formatClock(start);
  const end = start + durationMinutes;
  return meridiem(start) === meridiem(end)
    ? `${formatGutterTime(start)}–${formatClock(end)}`
    : `${formatClock(start)}–${formatClock(end)}`;
}

/** `45 min`, `1 hr 30 min`, `2 hr`. */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const rest = minutes % 60;
  return `${Math.floor(minutes / 60)} hr${rest ? ` ${rest} min` : ''}`;
}

/** `50m`, `1h 30m`: free time and minutes left. */
export function formatShortDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const rest = minutes % 60;
  return `${Math.floor(minutes / 60)}h${rest ? ` ${rest}m` : ''}`;
}

/** A row's time text: `9:30–11:30 AM (2 hr)`, or just the time for a point in time. */
export function formatTimeText(start: MinutesOfDay, durationMinutes: number): string {
  const range = formatRange(start, durationMinutes);
  return durationMinutes === 0 ? range : `${range} (${formatDuration(durationMinutes)})`;
}

/** `Thu, Nov 19`. */
export function formatShortDate(date: ISODate): string {
  const local = fromISODate(date);
  return `${WEEKDAYS[local.getDay()]?.slice(0, 3)}, ${MONTHS[local.getMonth()]?.slice(0, 3)} ${local.getDate()}`;
}

/** `Today`, `Tomorrow`, `Yesterday`, or `Thu, Nov 19`: where a toast says something went. */
export function formatRelativeDate(date: ISODate, today: ISODate): string {
  const offset = daysBetween(today, date);
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  if (offset === -1) return 'Yesterday';
  return formatShortDate(date);
}

/** The parts of Plan's date title and subline. */
export interface DateTitle {
  /** `November 17` */
  monthDay: string;
  year: number;
  /** `Tuesday` */
  weekday: string;
}

export function dateTitle(date: ISODate): DateTitle {
  const local = fromISODate(date);
  return {
    monthDay: `${MONTHS[local.getMonth()]} ${local.getDate()}`,
    year: local.getFullYear(),
    weekday: WEEKDAYS[local.getDay()] ?? '',
  };
}
