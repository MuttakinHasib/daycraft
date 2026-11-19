import { ACTIVITY_ICONS, type IconName } from './icon-name';

/** A tab in the icon picker: a group of activity icons, shown by its first icon. */
export interface IconCategory {
  key: string;
  label: string;
  icons: readonly IconName[];
}

export const ICON_CATEGORIES: readonly IconCategory[] = [
  { key: 'day', label: 'Daily rhythm', icons: ['check', 'alarm', 'sun', 'moon'] },
  { key: 'health', label: 'Health and fitness', icons: ['run', 'dumbbell', 'heart', 'drop', 'wind', 'leaf'] },
  { key: 'food', label: 'Food and home', icons: ['coffee', 'utensils', 'cart', 'home'] },
  { key: 'work', label: 'Work and study', icons: ['laptop', 'briefcase', 'doc', 'pen', 'book', 'cap'] },
  { key: 'people', label: 'Calls and media', icons: ['phone', 'video', 'music', 'spark'] },
];

// Words that bring up each icon, in the person's language for an activity title.
const KEYWORDS: Record<string, readonly string[]> = {
  check: ['task', 'todo', 'done', 'check'],
  alarm: ['alarm', 'wake', 'rise', 'morning'],
  sun: ['sun', 'shine', 'morning', 'outside'],
  moon: ['moon', 'night', 'sleep', 'bed', 'wind', 'evening'],
  run: ['run', 'running', 'jog', 'walk', '5k'],
  dumbbell: ['gym', 'workout', 'lift', 'weights', 'training'],
  coffee: ['coffee', 'tea', 'breakfast', 'cafe'],
  utensils: ['lunch', 'dinner', 'meal', 'eat', 'cook', 'food'],
  book: ['read', 'reading', 'book', 'pages'],
  cap: ['study', 'class', 'course', 'learn', 'lecture', 'exam'],
  laptop: ['work', 'code', 'coding', 'deep', 'design'],
  video: ['meeting', 'call', 'sync', 'zoom', 'standup'],
  doc: ['write', 'draft', 'report', 'doc', 'notes', 'email', 'emails'],
  phone: ['phone', 'call', 'dentist', 'mom', 'dad'],
  pen: ['plan', 'journal', 'sketch', 'reflect'],
  heart: ['health', 'date', 'love', 'self', 'care'],
  leaf: ['garden', 'plants', 'nature', 'park'],
  drop: ['water', 'drink', 'hydrate', 'shower'],
  wind: ['breathe', 'meditate', 'meditation', 'yoga', 'stretch'],
  cart: ['shopping', 'shop', 'groceries', 'grocery', 'buy', 'errand'],
  home: ['home', 'clean', 'cleaning', 'laundry', 'chores', 'house'],
  music: ['music', 'guitar', 'piano', 'practice', 'song'],
  briefcase: ['office', 'client', 'commute', 'job', 'interview'],
  spark: ['idea', 'brainstorm', 'create', 'creative', 'project'],
};

const MAX_SUGGESTIONS = 3;

function wordsOf(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Up to three icons that fit the title: the most matching words first, then the picker's order. */
export function suggestIcons(title: string): IconName[] {
  const words = new Set(wordsOf(title));
  return ACTIVITY_ICONS.map((icon, order) => ({
    icon,
    order,
    score: (KEYWORDS[icon] ?? []).filter((keyword) => words.has(keyword)).length,
  }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, MAX_SUGGESTIONS)
    .map(({ icon }) => icon);
}

/** The activity icons whose name or a keyword starts with the search, in the picker's order. */
export function searchIcons(query: string): readonly IconName[] {
  const term = query.trim().toLowerCase();
  if (!term) return ACTIVITY_ICONS;
  return ACTIVITY_ICONS.filter(
    (icon) => icon.startsWith(term) || (KEYWORDS[icon] ?? []).some((keyword) => keyword.startsWith(term)),
  );
}
