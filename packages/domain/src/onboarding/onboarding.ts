import type { MinutesOfDay } from '../calendar';
import { DAY_END, DAY_START } from '../timeline/day-limits';

// The first run (onboarding doc): a pure flow of screens over a draft. Screens render the view and dispatch events;
// the outcome says what to save. Later tickets add the intro, One thing and Place it as more screens.

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

export const OnboardingScreen = {
  DAY_EDGES: 'dayEdges',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type OnboardingScreen = (typeof OnboardingScreen)[keyof typeof OnboardingScreen];

// The setup steps in order; the counter reads "Step N of" their count.
const SETUP_STEPS: readonly OnboardingScreen[] = [OnboardingScreen.DAY_EDGES];

export interface OnboardingDraft {
  dayEdges: DayEdges;
}

/** What onboarding ends with: `finished` for Done, false for Skip; either way the draft so far is saved. */
export interface OnboardingOutcome {
  finished: boolean;
  dayEdges: DayEdges;
}

export interface OnboardingState {
  screen: OnboardingScreen;
  draft: OnboardingDraft;
  outcome: OnboardingOutcome | null;
}

export type OnboardingEvent =
  | { type: 'continue' }
  | { type: 'back' }
  | { type: 'skip' }
  | { type: 'setEdge'; edge: DayEdge; minute: number }
  | { type: 'stepEdge'; edge: DayEdge; by: 1 | -1 };

export interface OnboardingView {
  /** "Step 1 of 1", or null on screens outside setup. */
  step: string | null;
  cta: string;
  ctaEnabled: boolean;
  canGoBack: boolean;
}

/** A first run opening on its first step, with the day edges already in place (defaults, or the saved ones on replay). */
export function startOnboarding(dayEdges: DayEdges): OnboardingState {
  return { screen: SETUP_STEPS[0] ?? OnboardingScreen.DAY_EDGES, draft: { dayEdges }, outcome: null };
}

export function onboardingView({ screen }: OnboardingState): OnboardingView {
  const index = SETUP_STEPS.indexOf(screen);
  return {
    step: index >= 0 ? `Step ${index + 1} of ${SETUP_STEPS.length}` : null,
    cta: 'Continue',
    ctaEnabled: true,
    canGoBack: index > 0,
  };
}

export function onboardingReducer(state: OnboardingState, event: OnboardingEvent): OnboardingState {
  if (state.outcome) return state;
  const index = SETUP_STEPS.indexOf(state.screen);
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
    case 'back': {
      const previous = SETUP_STEPS[index - 1];
      return previous ? { ...state, screen: previous } : state;
    }
    case 'continue': {
      const next = SETUP_STEPS[index + 1];
      if (next) return { ...state, screen: next };
      return { ...state, outcome: { finished: true, dayEdges: state.draft.dayEdges } };
    }
    case 'skip':
      return { ...state, outcome: { finished: false, dayEdges: state.draft.dayEdges } };
    default:
      return state;
  }
}
