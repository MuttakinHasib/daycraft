/**
 * Daycraft icon names, as the design prototype names them. Data stores these names,
 * never an icon library's names (ADR-0002); the icons package maps each one to a glyph.
 */
export const IconName = {
  // Activity icons: the set offered when picking an icon for an activity, habit or routine.
  CHECK: 'check',
  ALARM: 'alarm',
  SUN: 'sun',
  MOON: 'moon',
  RUN: 'run',
  DUMBBELL: 'dumbbell',
  COFFEE: 'coffee',
  UTENSILS: 'utensils',
  BOOK: 'book',
  CAP: 'cap',
  LAPTOP: 'laptop',
  VIDEO: 'video',
  DOC: 'doc',
  PHONE: 'phone',
  PEN: 'pen',
  HEART: 'heart',
  LEAF: 'leaf',
  DROP: 'drop',
  WIND: 'wind',
  CART: 'cart',
  HOME: 'home',
  MUSIC: 'music',
  BRIEFCASE: 'briefcase',
  SPARK: 'spark',

  // Interface icons: navigation, actions and metadata.
  ARROW_R: 'arrow-r',
  CALENDAR: 'calendar',
  CASE: 'case',
  CHECKSQ: 'checksq',
  CHEV_D: 'chev-d',
  CHEV_L: 'chev-l',
  CHEV_R: 'chev-r',
  CLOCK: 'clock',
  EDIT: 'edit',
  FLAG: 'flag',
  FLAME: 'flame',
  FOLDER: 'folder',
  GRID: 'grid',
  INBOX: 'inbox',
  JOURNAL: 'journal',
  KANBAN: 'kanban',
  LIST: 'list',
  MINUS: 'minus',
  PAUSE: 'pause',
  PIN: 'pin',
  PLAY: 'play',
  PLUS: 'plus',
  REPEAT: 'repeat',
  ROUTINE: 'routine',
  SHUFFLE: 'shuffle',
  STOP: 'stop',
  TAG: 'tag',
  TARGET: 'target',
  TIMELINE: 'timeline',
  TIMER: 'timer',
  TRASH: 'trash',
  UPCOMING: 'upcoming',
  X: 'x',

  // Mood faces, from 1 (Rough) to 5 (Great).
  M1: 'm1',
  M2: 'm2',
  M3: 'm3',
  M4: 'm4',
  M5: 'm5',
} as const;

export type IconName = (typeof IconName)[keyof typeof IconName];

const iconNames: ReadonlySet<string> = new Set(Object.values(IconName));

export function isIconName(value: string): value is IconName {
  return iconNames.has(value);
}
