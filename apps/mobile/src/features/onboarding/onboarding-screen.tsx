import { hueColors, hueTints, withOpacity } from '@daycraft/design-tokens';
import {
  DayEdge,
  DEFAULT_DAY_EDGES,
  formatClock,
  layoutDay,
  onboardingReducer,
  onboardingView,
  PHONE_SCALE,
  startOnboarding,
  todayISO,
  type Activity,
  type DayEdges,
  type ISODate,
  type OnboardingEvent,
} from '@daycraft/domain';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useReducer, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, SlideInDown } from 'react-native-reanimated';

import { Button, IconButton, TextButton } from '@/components/ui';
import { activityRepository } from '@/data/activity-store';
import { Timeline } from '@/features/plan/timeline';
import { useTimelineDrag } from '@/features/plan/use-timeline-drag';

import { markOnboarded } from './onboarding-store';

const SHEET_UP_MS = 550;
// Room the fitted timeline keeps clear: its top padding, the Wind down circle and the Continue button.
const FIT_RESERVED = 200;
const MIN_FIT_SCALE = 0.25;
const EDGE_LABEL: Record<DayEdge, string> = { wakeUp: 'Rise and shine', windDown: 'Wind down' };

interface EdgeStepperProps {
  edge: DayEdge;
  minute: number;
  onStep: (by: 1 | -1) => void;
}

/** The two routines as onboarding draws them on the timeline; never saved as they are. */
function previewActivities(edges: DayEdges, date: ISODate): Activity[] {
  const routine = (edge: DayEdge): Activity => ({
    id: edge,
    date,
    start: edges[edge],
    durationMinutes: 0,
    title: EDGE_LABEL[edge],
    hue: edge === DayEdge.WAKE_UP ? 'clay' : 'slate',
    icon: edge === DayEdge.WAKE_UP ? 'alarm' : 'moon',
    kind: 'routine',
    done: false,
    notes: '',
    subtasks: [],
    repeat: 'daily',
    priority: 'none',
    labels: [],
    location: '',
    projectId: null,
    seriesId: null,
  });
  return [routine(DayEdge.WAKE_UP), routine(DayEdge.WIND_DOWN)];
}

/** − time + for one routine: the way to set it without dragging. */
function EdgeStepper({ edge, minute, onStep }: EdgeStepperProps) {
  const label = EDGE_LABEL[edge];
  return (
    <View className="flex-1 gap-2 rounded-card bg-card p-3">
      <Text className="type-meta font-sans-semibold text-ink-muted">{label}</Text>
      <View className="flex-row items-center justify-between">
        <IconButton icon="minus" accessibilityLabel={`${label} 15 minutes earlier`} onPress={() => onStep(-1)} />
        <Text
          accessibilityLabel={`${label}, ${formatClock(minute)}`}
          style={{ fontVariant: ['tabular-nums'] }}
          className="type-body font-sans-semibold text-ink"
        >
          {formatClock(minute)}
        </Text>
        <IconButton icon="plus" accessibilityLabel={`${label} 15 minutes later`} onPress={() => onStep(1)} />
      </View>
    </View>
  );
}

/**
 * Onboarding (onboarding doc). For now one setup step, Day edges: Rise and shine and Wind down on the real timeline,
 * dragged or stepped in 15 minutes. Continue and Skip both save them as daily routines and open Plan.
 */
export function OnboardingScreen() {
  const [today] = useState(() => todayISO(new Date()));
  const [state, dispatch] = useReducer(onboardingReducer, null, () =>
    startOnboarding(activityRepository.readDayEdges(today) ?? DEFAULT_DAY_EDGES),
  );
  const view = onboardingView(state);
  const edges = state.draft.dayEdges;
  const send = (event: OnboardingEvent) => dispatch(event);

  // The whole day fits the sheet, so both routines stay in view while they move.
  const [sheetHeight, setSheetHeight] = useState(0);
  const scale =
    sheetHeight > 0
      ? Math.min(PHONE_SCALE, Math.max(MIN_FIT_SCALE, (sheetHeight - FIT_RESERVED) / (edges.windDown - edges.wakeUp)))
      : PHONE_SCALE;
  const drag = useTimelineDrag(
    ({ id, timing }) => send({ type: 'setEdge', edge: id as DayEdge, minute: timing.start }),
    { step: 15, scale },
  );
  const activities = previewActivities(edges, today);
  const layout = layoutDay({ activities, scale, isToday: false, now: 0, preview: drag.preview });

  // A light tap on each 15-minute step while dragging, and on each − / +.
  const lastStart = useRef<number | null>(null);
  const previewStart = drag.preview?.start ?? null;
  useEffect(() => {
    if (previewStart !== null && lastStart.current !== null && previewStart !== lastStart.current) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    lastStart.current = previewStart;
  }, [previewStart]);

  useEffect(() => {
    if (!state.outcome) return;
    activityRepository.saveDayEdges(state.outcome.dayEdges, today);
    markOnboarded();
    router.back();
  }, [state.outcome, today]);

  const step = (edge: DayEdge, by: 1 | -1) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    send({ type: 'stepEdge', edge, by });
  };

  return (
    <View className="flex-1 bg-canvas pt-safe">
      <View className="h-14 flex-row items-center justify-between px-4">
        {view.canGoBack ? (
          <IconButton icon="chev-l" accessibilityLabel="Back" onPress={() => send({ type: 'back' })} />
        ) : (
          <View className="size-8" />
        )}
        <TextButton label="Skip" onPress={() => send({ type: 'skip' })} />
      </View>
      <View className="gap-2 px-5 pt-2 pb-4">
        {view.step && <Text className="type-meta font-sans-semibold text-ink-muted">{view.step}</Text>}
        {/* The highlight is decoration: screen readers hear the plain sentence. */}
        <Text
          accessibilityRole="header"
          accessibilityLabel="When does your day start and end?"
          className="type-title text-ink"
        >
          {'When does your day '}
          <Text style={{ backgroundColor: withOpacity(hueColors.sun, hueTints.highlight) }}>start and end</Text>?
        </Text>
        <Text className="type-body text-ink-muted">Drag Rise and shine and Wind down, or use the buttons.</Text>
        <View className="mt-2 flex-row gap-2.5">
          <EdgeStepper edge={DayEdge.WAKE_UP} minute={edges.wakeUp} onStep={(by) => step(DayEdge.WAKE_UP, by)} />
          <EdgeStepper edge={DayEdge.WIND_DOWN} minute={edges.windDown} onStep={(by) => step(DayEdge.WIND_DOWN, by)} />
        </View>
      </View>
      <Animated.View
        entering={SlideInDown.duration(SHEET_UP_MS).easing(Easing.out(Easing.cubic))}
        onLayout={(event) => setSheetHeight(event.nativeEvent.layout.height)}
        className="flex-1 overflow-hidden rounded-t-sheet border-t border-line bg-surface pt-3"
      >
        <Timeline layout={layout} now={0} justCreatedId={null} drag={drag} />
      </Animated.View>
      <View pointerEvents="box-none" className="absolute inset-x-0 bottom-0 px-5 pb-safe-offset-4">
        <Button disabled={!view.ctaEnabled} onPress={() => send({ type: 'continue' })}>
          {view.cta}
        </Button>
      </View>
    </View>
  );
}
