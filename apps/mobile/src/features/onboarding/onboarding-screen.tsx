import {
  ActivityKind,
  DayEdge,
  DEFAULT_DAY_EDGES,
  formatDuration,
  layoutDay,
  minutesOfDay,
  onboardingReducer,
  OnboardingScreen as Screen,
  onboardingView,
  PHONE_SCALE,
  placeTask,
  Priority,
  Repeat,
  startOnboarding,
  todayISO,
  type Activity,
  type DayEdges,
  type ISODate,
  type OnboardingEvent,
  type OnboardingOutcome,
  type OnboardingTask,
} from '@daycraft/domain';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useReducer, useRef, useState, type ComponentRef } from 'react';
import { AccessibilityInfo, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, IconButton, useToast } from '@/components/ui';
import { activityRepository, useDayActivities } from '@/data/activity-store';
import { markJustCreated, requestLanding, selectDate } from '@/features/plan/plan-state';
import { Timeline } from '@/features/plan/timeline';
import { useTimelineDrag } from '@/features/plan/use-timeline-drag';
import { useNow } from '@/lib/use-now';
import { useTopInset } from '@/lib/use-top-inset';

import { Headline, type HeadlineCopy } from './headline';
import { BeatDots, IntroBeat, IntroStory, STORY_TOTAL_MINUTES } from './intro-story';
import { OneThing } from './one-thing';
import { markOnboarded } from './onboarding-store';

// Onboarding (onboarding doc; canvas page "v3 · Clean", board "v3 · Onboarding · light"). The intro story, then
// Day edges, One thing and Place it on one continuous Plan sheet that slides between steps.

const SHEET_MS = 550;
const SHEET_EASING = Easing.bezier(0.2, 0.8, 0.2, 1);
const SHEET_GAP = 16;
// The CTA tucks into the home indicator's spare space, as system bars do.
const BOTTOM_TUCK = 12;
const MIN_EDGE = 16;
const COUNT_MS = 1000;
// Room the fitted Day edges timeline keeps clear: its top padding, the Wind down row and the CTA.
const FIT_RESERVED = 200;
const MIN_FIT_SCALE = 0.25;
// Place it scrolls the new task to this far below the sheet's top.
const TASK_OFFSET = 120;
const TASK_ID = 'onboarding-task';
const EDGE_LABEL: Record<DayEdge, string> = { wakeUp: 'Rise and shine', windDown: 'Wind down' };
// Shown above the CTA, and said, when nothing could be saved.
const SAVE_FAILED = 'Couldn’t save today. Try again.';

const Phase = {
  INTRO: 'intro',
  SETUP: 'setup',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
type Phase = (typeof Phase)[keyof typeof Phase];

const INTRO_COPY: Record<IntroBeat, Omit<HeadlineCopy, 'highlight'> & { highlight?: string }> = {
  0: {
    before: 'Your list looks ',
    highlight: 'short',
    after: '.',
    hue: 'sky',
    sub: 'But a list never says how long each thing takes.',
  },
  1: { before: 'That’s ', after: '.', hue: 'rose', sub: 'You have 5 hours left today.' },
  2: {
    before: 'Daycraft gives each one ',
    highlight: 'a time',
    after: '.',
    hue: 'sage',
    sub: 'What fits goes on today. What doesn’t moves to tomorrow.',
  },
};

const STEP_COPY: Record<Screen, HeadlineCopy> = {
  dayEdges: {
    before: 'When does your day ',
    highlight: 'start and end',
    after: '?',
    hue: 'amber',
    sub: 'Drag Rise and shine and Wind down, or use the buttons.',
  },
  oneThing: { before: 'What’s ', highlight: 'one thing', after: ' you want to do today?', hue: 'clay' },
  placeIt: {
    before: 'Put it on your ',
    highlight: 'timeline',
    after: '.',
    hue: 'pine',
    sub: 'Drag it to move it. Drag its bottom edge to change how long it takes.',
  },
};

function blankActivity(date: ISODate): Omit<Activity, 'id' | 'start' | 'durationMinutes' | 'title' | 'hue' | 'icon'> {
  return {
    date,
    kind: ActivityKind.TASK,
    done: false,
    notes: '',
    subtasks: [],
    repeat: Repeat.NEVER,
    priority: Priority.NONE,
    labels: [],
    location: '',
    projectId: null,
    seriesId: null,
  };
}

/** The two routines as onboarding draws them on the timeline; never saved as they are. */
function edgeActivities(edges: DayEdges, date: ISODate): Activity[] {
  const routine = (edge: DayEdge): Activity => ({
    ...blankActivity(date),
    id: edge,
    start: edges[edge],
    durationMinutes: 0,
    title: EDGE_LABEL[edge],
    hue: edge === DayEdge.WAKE_UP ? 'clay' : 'slate',
    icon: edge === DayEdge.WAKE_UP ? 'alarm' : 'moon',
    kind: ActivityKind.ROUTINE,
    repeat: Repeat.DAILY,
  });
  return [routine(DayEdge.WAKE_UP), routine(DayEdge.WIND_DOWN)];
}

function taskActivity(task: OnboardingTask, date: ISODate): Activity {
  return { ...blankActivity(date), id: TASK_ID, ...task };
}

/** The intro's cost beat counts its headline up from 0 to the list's total. */
function useCountUp(active: boolean, to: number): number {
  const reduceMotion = useReducedMotion();
  const counting = active && !reduceMotion;
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!counting) return;
    const startedAt = Date.now();
    let frame = 0;
    const tick = () => {
      const progress = Math.min(1, (Date.now() - startedAt) / COUNT_MS);
      setValue(Math.round((to * (1 - (1 - progress) ** 3)) / 5) * 5);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      setValue(0);
    };
  }, [counting, to]);
  return counting ? value : to;
}

interface StepperProps {
  edge: DayEdge;
  onStep: (edge: DayEdge, by: 1 | -1) => void;
}

/** − and + at a routine's right edge: the way to set it without dragging. */
function EdgeSteppers({ edge, onStep }: StepperProps) {
  const label = EDGE_LABEL[edge];
  return (
    <>
      <IconButton icon="minus" accessibilityLabel={`${label} 15 minutes earlier`} onPress={() => onStep(edge, -1)} />
      <IconButton icon="plus" accessibilityLabel={`${label} 15 minutes later`} onPress={() => onStep(edge, 1)} />
    </>
  );
}

export function OnboardingScreen() {
  const clock = useNow();
  const [today] = useState(() => todayISO(new Date()));
  const now = minutesOfDay(clock);
  const toast = useToast();
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const topInset = useTopInset();
  const [state, dispatch] = useReducer(onboardingReducer, null, () =>
    startOnboarding(activityRepository.readDayEdges(today) ?? DEFAULT_DAY_EDGES),
  );
  const send = (event: OnboardingEvent) => dispatch(event);
  const [phase, setPhase] = useState<Phase>(Phase.INTRO);
  const [beat, setBeat] = useState<IntroBeat>(IntroBeat.PROBLEM);
  const view = onboardingView(state);
  const { dayEdges: edges, task } = state.draft;
  const screen = state.screen;
  const intro = phase === Phase.INTRO;

  // Today's own activities, for Place it; the saved day-edge routines are drawn from the draft instead.
  const saved = useDayActivities(today).filter(
    (activity) => !(activity.kind === ActivityKind.ROUTINE && Object.values(EDGE_LABEL).includes(activity.title)),
  );

  // The sheet: its top follows the headline, and it slides away for the intro and while typing One thing.
  const [rootHeight, setRootHeight] = useState(0);
  const [headBottom, setHeadBottom] = useState(0);
  const sheetShown = !intro && screen !== Screen.ONE_THING;
  const sheetTop = sheetShown && headBottom > 0 ? headBottom + SHEET_GAP : rootHeight;
  const sheetHeight = Math.max(0, rootHeight - sheetTop);
  const sheetStyle = useAnimatedStyle(() => ({
    top: reduceMotion ? sheetTop : withTiming(sheetTop, { duration: SHEET_MS, easing: SHEET_EASING }),
  }));

  // Day edges fits the whole day into the sheet; Place it is the Plan timeline at its usual scale.
  const placing = screen === Screen.PLACE_IT;
  const fitScale =
    sheetHeight > 0
      ? Math.min(PHONE_SCALE, Math.max(MIN_FIT_SCALE, (sheetHeight - FIT_RESERVED) / (edges.windDown - edges.wakeUp)))
      : PHONE_SCALE;
  const scale = placing ? PHONE_SCALE : fitScale;
  const drag = useTimelineDrag(
    ({ id, timing }) => {
      if (id === TASK_ID) send({ type: 'setTaskTiming', ...timing });
      else send({ type: 'setEdge', edge: id as DayEdge, minute: timing.start });
    },
    { step: placing ? undefined : 15, scale },
  );
  // Day edges moves its two routines. On Place it only the task moves: the rest of the day is there for context.
  const isDraggable = (id: string) => !placing || id === TASK_ID;
  const hasDragActions = (id: string) => placing && id === TASK_ID;
  const activities = placing
    ? [...edgeActivities(edges, today), ...saved, taskActivity(task, today)]
    : edgeActivities(edges, today);
  const layout = layoutDay({ activities, scale, isToday: placing, now, preview: drag.preview });

  // A light tap on each 15-minute step while dragging a day edge.
  const lastStart = useRef<number | null>(null);
  const previewStart = !placing ? (drag.preview?.start ?? null) : null;
  useEffect(() => {
    if (previewStart !== null && lastStart.current !== null && previewStart !== lastStart.current) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    lastStart.current = previewStart;
  }, [previewStart]);

  // Place it lands with the task in view and popping in.
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [popDone, setPopDone] = useState(false);
  const poppedId = placing && !popDone ? TASK_ID : null;
  const taskTop = layout.rows.find((row) => row.activity.id === TASK_ID)?.top ?? null;
  const taskTopRef = useRef(taskTop);
  useEffect(() => {
    taskTopRef.current = taskTop;
  }, [taskTop]);
  useEffect(() => {
    if (!placing) return;
    scrollRef.current?.scrollTo({ y: Math.max(0, (taskTopRef.current ?? 0) - TASK_OFFSET), animated: false });
    const timer = setTimeout(() => setPopDone(true), 900);
    return () => {
      clearTimeout(timer);
      setPopDone(false);
    };
  }, [placing]);

  // Done writes the edges and the task, Skip the edges set so far, each in one transaction. A failed write saves
  // nothing: onboarding stays open and says so. After a saved one it never shows again by itself.
  // Each outcome is saved once, even if this effect runs again for it.
  const savedOutcome = useRef<OnboardingOutcome | null>(null);
  useEffect(() => {
    const outcome = state.outcome;
    if (!outcome || savedOutcome.current === outcome) return;
    savedOutcome.current = outcome;
    let created: Activity | null = null;
    try {
      created = activityRepository.saveOnboarding(outcome, today);
    } catch {
      AccessibilityInfo.announceForAccessibility(SAVE_FAILED);
      dispatch({ type: 'saveFailed' });
      return;
    }
    markOnboarded();
    selectDate(today);
    // Plan sits under onboarding and does not land again by itself when a full-screen screen closes.
    requestLanding();
    if (created) markJustCreated(created.id);
    // Onboarding always ends on Plan: dismissed down to it when it is in the history (under a first run, or under
    // Replay from another tab), and replacing onboarding when it is the only screen, as after a link or a cold start.
    router.dismissTo('/');
    if (outcome.finished) {
      toast('Today is set up', { label: 'Replay', onPress: () => router.push('/onboarding') });
    }
  }, [state.outcome, today, toast]);

  const step = (edge: DayEdge, by: 1 | -1) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    send({ type: 'stepEdge', edge, by });
  };

  const count = useCountUp(intro && beat === IntroBeat.COST, STORY_TOTAL_MINUTES);
  const introCopy = INTRO_COPY[beat];
  const headline: HeadlineCopy = intro
    ? { ...introCopy, highlight: introCopy.highlight ?? formatDuration(count) }
    : STEP_COPY[screen];

  const canGoBack = intro ? beat > IntroBeat.PROBLEM : true;
  const back = () => {
    if (intro) setBeat((current) => (current - 1) as IntroBeat);
    else if (view.canGoBack) send({ type: 'back' });
    else setPhase(Phase.INTRO);
  };
  const cta = intro ? (beat === IntroBeat.ANSWER ? 'Set up today' : 'Continue') : view.cta;
  const next = () => {
    if (intro) {
      if (beat === IntroBeat.ANSWER) setPhase(Phase.SETUP);
      else setBeat((current) => (current + 1) as IntroBeat);
      return;
    }
    if (screen === Screen.ONE_THING) {
      send({
        type: 'continue',
        start: placeTask({
          activities: [...edgeActivities(edges, today), ...saved],
          edges,
          now,
          durationMinutes: task.durationMinutes,
        }),
      });
      return;
    }
    send({ type: 'continue' });
  };

  return (
    <View onLayout={(event) => setRootHeight(event.nativeEvent.layout.height)} className="flex-1 bg-canvas">
      <Animated.View
        style={[sheetStyle, { visibility: sheetShown ? 'visible' : 'hidden' }]}
        className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-sheet border-t border-line bg-surface shadow-float"
      >
        <View className="h-4.5 items-center justify-center">
          <View className="h-1 w-9 rounded-full bg-line-strong" />
        </View>
        <Timeline
          layout={layout}
          now={now}
          scrollRef={scrollRef}
          justCreatedId={poppedId}
          drag={drag}
          isDraggable={isDraggable}
          hasDragActions={hasDragActions}
          renderAccessory={placing ? undefined : (id) => <EdgeSteppers edge={id as DayEdge} onStep={step} />}
        />
      </Animated.View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
        style={{ paddingTop: topInset }}
        className="flex-1"
      >
        <View className="h-10 flex-row items-center justify-between px-3.5">
          {canGoBack ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={back}
              className="h-10 flex-row items-center gap-0.5 active:opacity-70"
            >
              <Icon name="chev-l" size={20} colorClassName="text-accent-text" />
              <Text className="type-body font-sans-semibold text-accent-text">Back</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => send({ type: 'skip' })}
            className="h-10 justify-center px-1.5 active:opacity-70"
          >
            <Text className="type-body font-sans-semibold text-ink-muted">Skip</Text>
          </Pressable>
        </View>
        <View
          pointerEvents="box-none"
          onLayout={(event) => setHeadBottom(event.nativeEvent.layout.y + event.nativeEvent.layout.height)}
        >
          <Headline step={intro ? null : view.step} {...headline} />
        </View>
        <View pointerEvents="box-none" className="flex-1">
          {intro && <IntroStory beat={beat} />}
          {!intro && screen === Screen.ONE_THING && (
            <OneThing
              title={task.title}
              onChangeTitle={(title) => send({ type: 'setTitle', title })}
              onPickIdea={(title) => send({ type: 'pickIdea', title })}
              onSubmit={() => view.ctaEnabled && next()}
            />
          )}
        </View>
        <View
          pointerEvents="box-none"
          style={{ paddingBottom: Math.max(MIN_EDGE, insets.bottom - BOTTOM_TUCK) }}
          className="px-4"
        >
          {intro && <BeatDots beat={beat} />}
          {!intro && state.saveFailed && (
            // The CTA under it is the retry.
            <Text accessibilityRole="alert" className="mb-2 text-center type-body-sm font-sans-medium text-ink-muted">
              {SAVE_FAILED}
            </Text>
          )}
          <View className="rounded-full shadow-float">
            <Button disabled={!intro && !view.ctaEnabled} onPress={next}>
              {cta}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
