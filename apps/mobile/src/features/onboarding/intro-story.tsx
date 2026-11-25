import { hueColors, withOpacity } from '@daycraft/design-tokens';
import { formatClock, formatDuration, formatGutterTime, type ActivityHue, type IconName } from '@daycraft/domain';
import { useEffect } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  type SharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/ui';
import { useThemeColors } from '@/theme/app-theme';

// The intro's three beats (onboarding doc, canvas "v3 · Onboarding"): a short list, the same list at its real length
// against the time left today, then the list as a timeline with what doesn't fit moved to tomorrow.

export const IntroBeat = {
  PROBLEM: 0,
  COST: 1,
  ANSWER: 2,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type IntroBeat = (typeof IntroBeat)[keyof typeof IntroBeat];

interface StoryItem {
  title: string;
  icon: IconName;
  hue: ActivityHue;
  minutes: number;
  /** Where it lands on beat 3, or null when it moves to tomorrow. */
  start: number | null;
}

/** Fixed demo content; nothing here is saved. */
const ITEMS: readonly StoryItem[] = [
  { title: 'Finish the slides', icon: 'laptop', hue: 'clay', minutes: 120, start: 660 },
  { title: 'Groceries', icon: 'cart', hue: 'pine', minutes: 45, start: 780 },
  { title: 'Gym', icon: 'dumbbell', hue: 'sage', minutes: 60, start: 825 },
  { title: 'Clean the kitchen', icon: 'home', hue: 'amber', minutes: 45, start: 885 },
  { title: 'Plan the trip', icon: 'calendar', hue: 'iris', minutes: 120, start: null },
];

/** The list's total, which the cost beat counts up to: 6 hr 30 min. */
export const STORY_TOTAL_MINUTES = ITEMS.reduce((sum, item) => sum + item.minutes, 0);

const ROW_H = 48;
const ROW_GAP = 8;
const BAR_SCALE = 1;
const BAR_MIN = 40;
const BAR_GAP = 6;
const TL_SCALE = 0.5;
const TL_MIN = 48;
const TL_GAP = 10;
const TL_FIRST = 660;
const MOVE_MS = 750;
const STAGGER_LIST = 40;
const STAGGER_BARS = 90;
const STAGGER_TL = 60;
const LABEL_DELAY = 650;
const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

interface Frame {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  filled: boolean;
  opacity: number;
  /** Which content shows: the checklist row, the bar's label, or the capsule's icon. */
  face: 0 | 1 | 2;
  delay: number;
}

interface TimelineSpot {
  y: number;
  h: number;
}

function timelineSpots(): { spots: (TimelineSpot | null)[]; bottom: number } {
  let next = 0;
  const spots = ITEMS.map((item) => {
    if (item.start === null) return null;
    const h = Math.max(TL_MIN, item.minutes * TL_SCALE);
    const y = Math.max((item.start - TL_FIRST) * TL_SCALE, next);
    next = y + h + TL_GAP;
    return { y, h };
  });
  return { spots, bottom: next };
}

const TIMELINE = timelineSpots();
const GAP_Y = TIMELINE.bottom + 2;
const TRAY_Y = TIMELINE.bottom + 44;

function barTops(): { tops: number[]; limitY: number } {
  let cum = 0;
  let limitY = 0;
  const tops = ITEMS.map((item, index) => {
    const top = cum;
    cum += Math.max(BAR_MIN, item.minutes * BAR_SCALE) + BAR_GAP;
    if (index === 3) limitY = cum - 3;
    return top;
  });
  return { tops, limitY };
}

const BARS = barTops();

function frameFor(beat: IntroBeat, index: number, width: number): Frame {
  const item = ITEMS[index];
  if (!item) throw new Error('No story item');
  if (beat === IntroBeat.PROBLEM) {
    return {
      x: 12,
      y: index * (ROW_H + ROW_GAP),
      w: width - 24,
      h: ROW_H,
      r: 14,
      filled: false,
      opacity: 1,
      face: 0,
      delay: index * STAGGER_LIST,
    };
  }
  if (beat === IntroBeat.COST) {
    const h = Math.max(BAR_MIN, item.minutes * BAR_SCALE);
    return {
      x: 20,
      y: BARS.tops[index] ?? 0,
      w: width - 40,
      h,
      r: 16,
      filled: true,
      opacity: item.start === null ? 0.3 : 1,
      face: 1,
      delay: 150 + index * STAGGER_BARS,
    };
  }
  const spot = TIMELINE.spots[index];
  if (spot)
    return { x: 52, y: spot.y, w: 48, h: spot.h, r: 24, filled: true, opacity: 1, face: 2, delay: index * STAGGER_TL };
  return { x: 20, y: TRAY_Y + 26, w: 170, h: 40, r: 999, filled: false, opacity: 1, face: 1, delay: 200 };
}

/** How tall the story is on its tallest beat, for the screen's layout. */
export const STORY_HEIGHT = TRAY_Y + 80;

interface StoryRowProps {
  item: StoryItem;
  index: number;
  beat: IntroBeat;
  width: number;
}

function StoryRow({ item, index, beat, width }: StoryRowProps) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const frame = frameFor(beat, index, width);
  const hue = hueColors[item.hue];
  const tray = beat === IntroBeat.ANSWER && item.start === null;
  const fill = tray ? colors.sunken : frame.filled ? hue : withOpacity(hue, 0);

  const x = useSharedValue(frame.x);
  const y = useSharedValue(frame.y);
  const w = useSharedValue(frame.w);
  const h = useSharedValue(frame.h);
  const r = useSharedValue(frame.r);
  const opacity = useSharedValue(frame.opacity);
  const background = useSharedValue(fill);
  const faces = [
    useSharedValue(frame.face === 0 ? 1 : 0),
    useSharedValue(frame.face === 1 ? 1 : 0),
    useSharedValue(frame.face === 2 ? 1 : 0),
  ];

  useEffect(() => {
    const to = (value: SharedValue<number>, target: number, duration = MOVE_MS) => {
      value.value = reduceMotion ? target : withDelay(frame.delay, withTiming(target, { duration, easing: EASE }));
    };
    to(x, frame.x);
    to(y, frame.y);
    to(w, frame.w);
    to(h, frame.h);
    to(r, Math.min(frame.r, frame.h / 2));
    to(opacity, frame.opacity);
    faces.forEach((face, which) => to(face, frame.face === which ? 1 : 0, MOVE_MS / 2));
    background.value = reduceMotion ? fill : withDelay(frame.delay, withTiming(fill, { duration: MOVE_MS }));
    // Shared values are stable; the frame changes with the beat and the width.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat, width, fill, reduceMotion]);

  const box = useAnimatedStyle(() => ({
    left: x.value,
    top: y.value,
    width: w.value,
    height: h.value,
    borderRadius: r.value,
    opacity: opacity.value,
    backgroundColor: background.value,
  }));
  const [listFace, barFace, capsuleFace] = faces;
  const checklist = useAnimatedStyle(() => ({ opacity: listFace?.value ?? 0 }));
  const bar = useAnimatedStyle(() => ({ opacity: barFace?.value ?? 0 }));
  const capsule = useAnimatedStyle(() => ({ opacity: capsuleFace?.value ?? 0 }));
  const onBar = tray ? colors['ink-muted'] : colors['on-hue'];

  return (
    <>
      <Animated.View style={box} className="absolute overflow-hidden">
        <Animated.View style={checklist} className="absolute inset-y-0 right-3 left-2 h-12 flex-row items-center gap-3">
          <View className="size-6 rounded-full border-2 border-line-strong" />
          <Text numberOfLines={1} className="type-heading text-ink">
            {item.title}
          </Text>
        </Animated.View>
        <Animated.View style={bar} className="absolute top-0 right-3 left-3 h-9.5 flex-row items-center gap-2">
          <Icon name={item.icon} size={16} color={tray ? hue : onBar} />
          <Text
            numberOfLines={1}
            style={{ color: tray ? colors['ink-muted'] : onBar }}
            className="flex-1 type-body-sm font-sans-semibold"
          >
            {item.title}
          </Text>
          {!tray && (
            <Text
              style={{ color: onBar, fontVariant: ['tabular-nums'] }}
              className="type-meta font-sans-semibold opacity-85"
            >
              {formatDuration(item.minutes)}
            </Text>
          )}
        </Animated.View>
        <Animated.View style={capsule} className="absolute inset-0 items-center justify-center">
          <Icon name={item.icon} size={22} color={colors['on-hue']} />
        </Animated.View>
      </Animated.View>
      {beat === IntroBeat.ANSWER && item.start !== null && (
        <TimelineLabels item={item} y={TIMELINE.spots[index]?.y ?? 0} delay={LABEL_DELAY + index * STAGGER_TL} />
      )}
    </>
  );
}

interface TimelineLabelsProps {
  item: StoryItem;
  y: number;
  delay: number;
}

/** On the answer beat: start time in the gutter, time range and title, and a check ring. */
function TimelineLabels({ item, y, delay }: TimelineLabelsProps) {
  const reduceMotion = useReducedMotion();
  const start = item.start ?? 0;
  const entering = reduceMotion ? undefined : FadeIn.delay(delay).duration(280);
  return (
    <>
      <Animated.Text
        entering={entering}
        style={{ top: y + 2, fontVariant: ['tabular-nums'] }}
        className="absolute left-1 w-10 text-right type-micro font-sans-semibold text-ink-muted"
      >
        {formatGutterTime(start)}
      </Animated.Text>
      <Animated.View entering={entering} style={{ top: y + 2 }} className="absolute right-14 left-28 gap-px">
        <Text style={{ fontVariant: ['tabular-nums'] }} className="type-meta font-sans-medium text-ink-muted">
          {`${formatClock(start)} – ${formatClock(start + item.minutes)}`}
        </Text>
        <Text numberOfLines={1} className="type-activity text-ink">
          {item.title}
        </Text>
      </Animated.View>
      <Animated.View
        entering={entering}
        style={{ top: y + 12, borderColor: hueColors[item.hue] }}
        className="absolute right-5 size-6 rounded-full border-2"
      />
    </>
  );
}

interface IntroStoryProps {
  beat: IntroBeat;
}

/** The story under the intro headline. Decoration only: the headline carries the meaning for screen readers. */
export function IntroStory({ beat }: IntroStoryProps) {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const late = reduceMotion ? undefined : FadeIn.delay(900).duration(280);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={{ height: STORY_HEIGHT }}
      className="relative mt-6"
    >
      {beat === IntroBeat.COST && (
        <Animated.View entering={late} style={{ top: BARS.limitY }} className="absolute inset-x-3 z-10 h-0">
          <View className="absolute inset-x-0 -top-px border-t-2 border-dashed border-danger" />
          <View className="absolute -top-3 right-2 h-6 justify-center rounded-full border border-danger bg-canvas px-2.5">
            <Text style={{ fontVariant: ['tabular-nums'] }} className="type-meta font-sans-semibold text-danger">
              5 hr left today
            </Text>
          </View>
        </Animated.View>
      )}
      {beat === IntroBeat.ANSWER && (
        <>
          <Animated.View
            entering={reduceMotion ? undefined : FadeIn.delay(500).duration(280)}
            style={{ height: TIMELINE.bottom - TL_GAP }}
            className="absolute top-0 left-18.75 w-0.5 bg-line-strong"
          />
          <Animated.View
            entering={reduceMotion ? undefined : FadeIn.delay(1100).duration(280)}
            style={{ top: GAP_Y }}
            className="absolute left-28 flex-row items-center gap-1.5"
          >
            <Icon name="clock" size={15} colorClassName="text-ink-muted" />
            <Text className="type-body-sm font-sans-medium text-ink-muted">
              <Text className="font-sans-semibold text-accent-text">30 min</Text> free
            </Text>
          </Animated.View>
          <Animated.Text
            entering={late}
            style={{ top: TRAY_Y }}
            className="absolute left-5 type-label text-ink-subtle uppercase"
          >
            Moved to tomorrow
          </Animated.Text>
        </>
      )}
      {ITEMS.map((item, index) => (
        <StoryRow key={item.title} item={item} index={index} beat={beat} width={width} />
      ))}
    </View>
  );
}

interface BeatDotsProps {
  beat: IntroBeat;
}

/** Where the story is: three dots, the current one a wide accent pill. Gone on the last beat. */
export function BeatDots({ beat }: BeatDotsProps) {
  const colors = useThemeColors();
  return (
    <View
      aria-hidden
      style={{ opacity: beat === IntroBeat.ANSWER ? 0 : 1 }}
      className="flex-row justify-center gap-1.5 pb-4"
    >
      {[IntroBeat.PROBLEM, IntroBeat.COST, IntroBeat.ANSWER].map((dot) => (
        <View
          key={dot}
          style={{
            width: dot === beat ? 22 : 6,
            backgroundColor: dot === beat ? colors.accent : colors['line-strong'],
          }}
          className="h-1.5 rounded-full"
        />
      ))}
    </View>
  );
}
