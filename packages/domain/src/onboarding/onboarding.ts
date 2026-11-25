import type { Activity } from '../activity';
import type { ActivityColor } from '../activity-hue';
import type { MinutesOfDay } from '../calendar';
import { suggestIcons } from '../icon-catalog';
import type { IconName } from '../icon-name';
import { clampToDay, DAY_END, DAY_START } from '../timeline/day-limits';

// The first run (onboarding doc): a pure flow of screens over a draft. Screens render the view and dispatch events;
// the outcome says what to save. The intro story plays before these steps and saves nothing, so it lives in the app.

/** When the day starts and ends: the times of the Rise and shine and Wind down routines (glossary: Day edges). */
export interface DayEdges {
  wakeUp: MinutesOfDay;
  windDown: MinutesOfDay;
}

export const DayEdge = {
  WAKE_UP: 'wakeUp',
  WIND_DOWN: 'windDown',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type DayEdge = (typeof DayEdge)[keyof typeof DayEdge];

export interface DayEdgeChange {
  edge: DayEdge;
  minute: number;
}

export const DEFAULT_DAY_EDGES: DayEdges = { wakeUp: 420, windDown: 1380 };
/** Day edges move in steps of this many minutes. */
export const DAY_EDGE_STEP = 15;
/** The shortest day the edges allow: 6 hours. */
export const MIN_DAY_MINUTES = 360;

/** The edges after moving one: snapped to 15 minutes, inside 5:00 AM to midnight, and 6 hours from the other. */
export function withDayEdge(edges: DayEdges, { edge, minute }: DayEdgeChange): DayEdges {
  const snapped = Math.round(minute / DAY_EDGE_STEP) * DAY_EDGE_STEP;
  if (edge === DayEdge.WAKE_UP) {
    const max = Math.min(DAY_END, edges.windDown) - MIN_DAY_MINUTES;
    return { ...edges, wakeUp: Math.min(max, Math.max(DAY_START, snapped)) };
  }
  const min = Math.max(DAY_START, edges.wakeUp) + MIN_DAY_MINUTES;
  return { ...edges, windDown: Math.max(min, Math.min(DAY_END, snapped)) };
}

/** Whether edges follow the rules (on the 15-minute grid, inside the day, 6 hours apart). */
export function isDayEdges({ wakeUp, windDown }: DayEdges): boolean {
  const onGrid = (minute: number) => Number.isInteger(minute) && minute % DAY_EDGE_STEP === 0;
  return (
    onGrid(wakeUp) &&
    onGrid(windDown) &&
    wakeUp >= DAY_START &&
    windDown <= DAY_END &&
    windDown - wakeUp >= MIN_DAY_MINUTES
  );
}

/** The one task onboarding adds: what One thing set, placed on today by Place it. */
export interface OnboardingTask {
  title: string;
  icon: IconName;
  hue: ActivityColor;
  start: MinutesOfDay;
  durationMinutes: number;
}

/** An idea chip on One thing: it sets the title, icon, colour and length. */
export interface OnboardingIdea {
  title: string;
  icon: IconName;
  hue: ActivityColor;
  durationMinutes: number;
}

export const IDEAS: readonly OnboardingIdea[] = [
  { title: 'Deep work', icon: 'laptop', hue: 'clay', durationMinutes: 90 },
  { title: 'Workout', icon: 'dumbbell', hue: 'sage', durationMinutes: 45 },
  { title: 'Groceries', icon: 'cart', hue: 'pine', durationMinutes: 45 },
  { title: 'Call Mom', icon: 'phone', hue: 'iris', durationMinutes: 30 },
  { title: 'Laundry', icon: 'home', hue: 'slate', durationMinutes: 60 },
  { title: 'Read a chapter', icon: 'book', hue: 'amber', durationMinutes: 30 },
];

/** A typed title's length: 1 hour. */
export const DEFAULT_TASK_MINUTES = 60;
const TYPED_TASK_HUE: ActivityColor = 'clay';
const PLACE_STEP = 15;
const PLACE_LEAD = 5;
// A point-in-time activity (a routine) still blocks this long when looking for a free slot.
const POINT_IN_TIME_BLOCK = 10;

const ceilTo = (minute: number, step: number) => Math.ceil(minute / step) * step;

export interface PlaceTaskInput {
  /** Today's activities, the two day-edge routines included. */
  activities: readonly Activity[];
  edges: DayEdges;
  now: MinutesOfDay;
  durationMinutes: number;
}

/**
 * Where Place it drops the task: the first free 15-minute slot from now plus 5 minutes, between Rise and shine and
 * Wind down. When nothing fits it lands at now plus 5 (rounded up), kept inside the day edges.
 */
export function placeTask({ activities, edges, now, durationMinutes }: PlaceTaskInput): MinutesOfDay {
  const from = Math.max(edges.wakeUp, ceilTo(now + PLACE_LEAD, PLACE_STEP));
  const scheduled = activities
    .filter((activity) => activity.start !== null)
    .sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
  let candidate = from;
  for (const activity of scheduled) {
    const start = activity.start ?? 0;
    const end = start + (activity.durationMinutes || POINT_IN_TIME_BLOCK);
    if (end <= candidate) continue;
    if (candidate + durationMinutes <= start) break;
    candidate = ceilTo(end, PLACE_STEP);
  }
  if (candidate + durationMinutes <= edges.windDown) return candidate;
  const fallback = Math.min(Math.max(edges.wakeUp, from), edges.windDown);
  return clampToDay({ start: fallback, durationMinutes }).start;
}

export const OnboardingScreen = {
  DAY_EDGES: 'dayEdges',
  ONE_THING: 'oneThing',
  PLACE_IT: 'placeIt',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type OnboardingScreen = (typeof OnboardingScreen)[keyof typeof OnboardingScreen];

// The setup steps in order; the counter reads "Step N of" their count. Habits joins once the app has habits.
const SETUP_STEPS: readonly OnboardingScreen[] = [
  OnboardingScreen.DAY_EDGES,
  OnboardingScreen.ONE_THING,
  OnboardingScreen.PLACE_IT,
];

export interface OnboardingDraft {
  dayEdges: DayEdges;
  /** The task being made; its start is only meaningful from Place it on. */
  task: OnboardingTask;
}

/** What onboarding ends with: `finished` for Done, false for Skip (the edges so far are kept, no half-made task). */
export interface OnboardingOutcome {
  finished: boolean;
  dayEdges: DayEdges;
  task: OnboardingTask | null;
}

export interface OnboardingState {
  screen: OnboardingScreen;
  draft: OnboardingDraft;
  outcome: OnboardingOutcome | null;
  /** The last save failed: the flow is open again and says so until Done or Skip is pressed once more. */
  saveFailed: boolean;
}

export type OnboardingEvent =
  /** `start` is where Place it drops the task (see `placeTask`), given when One thing moves on. */
  | { type: 'continue'; start?: MinutesOfDay }
  | { type: 'back' }
  | { type: 'skip' }
  | { type: 'setEdge'; edge: DayEdge; minute: number }
  | { type: 'stepEdge'; edge: DayEdge; by: 1 | -1 }
  | { type: 'setTitle'; title: string }
  | { type: 'pickIdea'; title: string }
  | { type: 'setTaskTiming'; start: MinutesOfDay; durationMinutes: number }
  /** Nothing could be saved: onboarding reopens where it was and says so, until Done or Skip is tried again. */
  | { type: 'saveFailed' };

export interface OnboardingView {
  /** "Step 1 of 3", or null on screens outside setup. */
  step: string | null;
  cta: string;
  ctaEnabled: boolean;
  canGoBack: boolean;
}

const EMPTY_TASK: OnboardingTask = {
  title: '',
  icon: 'check',
  hue: TYPED_TASK_HUE,
  start: 0,
  durationMinutes: DEFAULT_TASK_MINUTES,
};

/** A first run opening on its first step, with the day edges already in place (defaults, or the saved ones on replay). */
export function startOnboarding(dayEdges: DayEdges): OnboardingState {
  return {
    screen: SETUP_STEPS[0] ?? OnboardingScreen.DAY_EDGES,
    draft: { dayEdges, task: EMPTY_TASK },
    outcome: null,
    saveFailed: false,
  };
}

const hasTitle = (task: OnboardingTask) => task.title.trim().length > 0;

const CTA: Record<OnboardingScreen, string> = {
  dayEdges: 'Continue',
  oneThing: 'Add to timeline',
  placeIt: 'Done',
};

export function onboardingView({ screen, draft }: OnboardingState): OnboardingView {
  const index = SETUP_STEPS.indexOf(screen);
  return {
    step: index >= 0 ? `Step ${index + 1} of ${SETUP_STEPS.length}` : null,
    cta: CTA[screen],
    ctaEnabled: screen !== OnboardingScreen.ONE_THING || hasTitle(draft.task),
    canGoBack: index > 0,
  };
}

/** The icon for a typed title, the last word that names one winning ("Morning run" runs rather than wakes). */
function iconForTitle(title: string): IconName {
  const words = title.split(/\s+/).filter(Boolean).reverse();
  for (const word of words) {
    const icon = suggestIcons(word)[0];
    if (icon) return icon;
  }
  return 'check';
}

/** A typed title: the idea it names, or the default length with an icon that fits the words. */
function typedTask(task: OnboardingTask, title: string): OnboardingTask {
  const idea = IDEAS.find((item) => item.title === title.trim());
  if (idea) return { ...task, ...idea, title };
  return {
    ...task,
    title,
    icon: iconForTitle(title),
    hue: TYPED_TASK_HUE,
    durationMinutes: DEFAULT_TASK_MINUTES,
  };
}

function withTask(state: OnboardingState, task: OnboardingTask): OnboardingState {
  return { ...state, draft: { ...state.draft, task } };
}

export function onboardingReducer(state: OnboardingState, event: OnboardingEvent): OnboardingState {
  // A failed save is the one event that reopens an ended flow.
  if (event.type === 'saveFailed') return state.outcome ? { ...state, outcome: null, saveFailed: true } : state;
  if (state.outcome) return state;
  const index = SETUP_STEPS.indexOf(state.screen);
  const { task } = state.draft;
  switch (event.type) {
    case 'setEdge':
      return { ...state, draft: { ...state.draft, dayEdges: withDayEdge(state.draft.dayEdges, event) } };
    case 'stepEdge': {
      const current = state.draft.dayEdges[event.edge];
      const dayEdges = withDayEdge(state.draft.dayEdges, {
        edge: event.edge,
        minute: current + event.by * DAY_EDGE_STEP,
      });
      return { ...state, draft: { ...state.draft, dayEdges } };
    }
    case 'setTitle':
      return withTask(state, typedTask(task, event.title));
    case 'pickIdea': {
      const idea = IDEAS.find((item) => item.title === event.title);
      return idea ? withTask(state, { ...task, ...idea }) : state;
    }
    case 'setTaskTiming':
      return withTask(state, { ...task, ...clampToDay(event) });
    case 'back': {
      const previous = SETUP_STEPS[index - 1];
      // Leaving the step where the save failed takes its message away.
      return previous ? { ...state, screen: previous, saveFailed: false } : state;
    }
    case 'continue': {
      if (!onboardingView(state).ctaEnabled) return state;
      const next = SETUP_STEPS[index + 1];
      if (next === OnboardingScreen.PLACE_IT) {
        return {
          ...withTask(state, { ...task, title: task.title.trim(), start: event.start ?? task.start }),
          screen: next,
        };
      }
      if (next) return { ...state, screen: next };
      return {
        ...state,
        outcome: { finished: true, dayEdges: state.draft.dayEdges, task },
        saveFailed: false,
      };
    }
    case 'skip':
      return {
        ...state,
        outcome: { finished: false, dayEdges: state.draft.dayEdges, task: null },
        saveFailed: false,
      };
    default:
      return state;
  }
}
