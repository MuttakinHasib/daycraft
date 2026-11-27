import {
  addFiveMinutes,
  doneLine,
  endedSession,
  formatRange,
  isComplete,
  pauseFocus,
  remainingSeconds,
  resumeFocus,
  startFocus,
  subtractFiveMinutes,
  type Activity,
  type FocusTimer,
} from '@daycraft/domain';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Button, Chip, colorValue, Icon, IconButton, IconButtonSize, inkClassOn } from '@/components/ui';
import { useActivity } from '@/data/activity-store';
import { focusSessionRepository } from '@/data/focus-store';
import { useTopInset } from '@/lib/use-top-inset';
import { useThemeColors } from '@/theme/app-theme';

// The setup's offered lengths (the spec's chips); a session opens on the prototype's default.
const LENGTH_MINUTES = [15, 25, 45, 60, 90] as const;
const DEFAULT_LENGTH_MINUTES = 25;
const SECOND_MS = 1_000;

// The 250pt ring (navigation-and-modules, Focus): a 10pt stroke around a 110pt-radius circle.
const RING_SIZE = 250;
const RING_CENTER = RING_SIZE / 2;
const RING_RADIUS = 110;
const RING_STROKE = 10;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const TABULAR = { fontVariant: ['tabular-nums' as const] };

/** The ring's clock, `25:00` style: presentation only, the domain owns the time it shows. */
function clockText(seconds: number): string {
  const whole = Math.round(seconds);
  const minutes = Math.floor(whole / 60);
  return `${String(minutes).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`;
}

interface FocusRingProps {
  /** What the fill is drawn in: the activity's hue, or the accent when the session has no activity. */
  hue: string;
  /** How much of the ring is filled, 0–1. */
  fill: number;
  clock: string;
  /** What the run reads: "Ready when you are", "Focusing" or "Paused". */
  state: string;
  /** What screen readers hear: "N minutes N seconds remaining". */
  remainingLabel: string;
}

/** The 250pt timer ring: a sunken track, the hue's fill, the clock and the state inside. */
function FocusRing({ hue, fill, clock, state, remainingLabel }: FocusRingProps) {
  const colors = useThemeColors();
  return (
    <View
      accessible
      accessibilityRole="timer"
      accessibilityLabel={remainingLabel}
      className="size-62.5 items-center justify-center"
    >
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        style={{ position: 'absolute' }}
      >
        <Circle
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke={colors.sunken}
          strokeWidth={RING_STROKE}
        />
        <Circle
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke={hue}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${fill * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
          transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}
        />
      </Svg>
      <Text adjustsFontSizeToFit minimumFontScale={0.75} style={TABULAR} className="type-clock text-ink">
        {clock}
      </Text>
      <Text className="mt-1 type-body-sm font-sans-semibold text-ink-muted">{state}</Text>
    </View>
  );
}

interface ActivityCardProps {
  activity: Activity;
}

/** The header's card for the focused activity: its hue capsule with the icon, the time and the title. */
function ActivityCard({ activity }: ActivityCardProps) {
  const time =
    activity.start === null ? 'Anytime' : formatRange(activity.start, activity.durationMinutes);
  return (
    <View className="mx-5 mt-6 flex-row items-center gap-3 rounded-card border border-line bg-surface px-4 py-3">
      <View
        style={{ backgroundColor: colorValue(activity.hue) }}
        className="h-13 w-10 items-center justify-center rounded-card"
      >
        <Icon name={activity.icon} size={18} colorClassName={inkClassOn(activity.hue)} />
      </View>
      <View className="min-w-0 flex-1">
        <Text style={TABULAR} className="type-meta text-ink-muted">
          {time}
        </Text>
        <Text numberOfLines={1} className="type-activity font-sans-semibold text-ink">
          {activity.title}
        </Text>
      </View>
    </View>
  );
}

interface StepButtonProps {
  /** What the button reads: −5 or +5. */
  label: string;
  /** What screen readers hear: Five minutes less, or Five minutes more. */
  accessibilityLabel: string;
  onPress: () => void;
}

/** One of the −5 and +5 step circles beside the play button. */
function StepButton({ label, accessibilityLabel, onPress }: StepButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="size-11 items-center justify-center rounded-full bg-sunken active:opacity-70"
    >
      <Text style={TABULAR} className="type-control font-sans-semibold text-ink">
        {label}
      </Text>
    </Pressable>
  );
}

interface FocusScreenProps {
  /** The activity the session focuses on, or null when it has none (the route without an id). */
  activityId: string | null;
}

/**
 * Focus (navigation-and-modules): the full-screen timer. Setup picks a length, the run fills the ring with the
 * activity's hue, and ending — by **End session** or by running out — saves the session through the focus
 * repository and shows its Done line. The timer's rules are the domain's; the screen holds none of its own.
 */
export function FocusScreen({ activityId }: FocusScreenProps) {
  const colors = useThemeColors();
  const topInset = useTopInset();
  const activity = useActivity(activityId);
  const activityTitle = activity?.title ?? null;
  const [lengthMinutes, setLengthMinutes] = useState<number>(DEFAULT_LENGTH_MINUTES);
  // The live session: null in setup, and again once it has ended.
  const [timer, setTimer] = useState<FocusTimer | null>(null);
  const [now, setNow] = useState(() => Date.now());
  // The Done line once the session ended; ticket 04 builds the real Done screen on this state.
  const [endedLine, setEndedLine] = useState<string | null>(null);

  const paused = timer !== null && timer.pausedAt !== null;
  // In setup the ring shows the chosen length; from Start focus on, the domain decides what is left.
  const remaining = timer === null ? lengthMinutes * 60 : remainingSeconds(timer, now);
  // The ring fills with what has run; in setup nothing is filled yet.
  const fill = timer === null ? 0 : Math.min(1, Math.max(0, 1 - remaining / timer.lengthSeconds));
  const hue = activity ? colorValue(activity.hue) : colors.accent;
  const wholeRemaining = Math.round(remaining);

  // Saving is shared by End session and the session running out. useCallback because the ticking effect
  // depends on it — a referential-identity need, not a reflex.
  const conclude = useCallback(
    (ended: FocusTimer, at: number) => {
      const record = endedSession({ timer: ended, now: at, activityId });
      focusSessionRepository.saveSession(record);
      setEndedLine(doneLine({ focusedSeconds: record.focusedSeconds, activityTitle }));
    },
    [activityId, activityTitle],
  );

  const beginSession = () => {
    const at = Date.now();
    setNow(at);
    setTimer(startFocus({ lengthMinutes, now: at }));
  };

  const toggleRunning = () => {
    if (!timer) return;
    const at = Date.now();
    setNow(at);
    setTimer(timer.pausedAt === null ? pauseFocus(timer, at) : resumeFocus(timer, at));
  };

  const adjust = (change: (current: FocusTimer, at: number) => FocusTimer) => () => {
    if (!timer) return;
    const at = Date.now();
    setNow(at);
    setTimer(change(timer, at));
  };

  const endSession = () => {
    // The endedLine check keeps a press that lands with the timer's own completion from saving twice.
    if (timer && endedLine === null) conclude(timer, Date.now());
  };

  // While the session runs, the clock ticks once a second; a session whose time is up ends by itself.
  useEffect(() => {
    if (!timer || timer.pausedAt !== null || endedLine !== null) return;
    const tick = () => {
      const at = Date.now();
      setNow(at);
      if (isComplete(timer, at)) conclude(timer, at);
    };
    tick();
    const interval = setInterval(tick, SECOND_MS);
    return () => clearInterval(interval);
  }, [timer, endedLine, conclude]);

  return (
    <View style={{ paddingTop: topInset }} className="flex-1 bg-canvas">
      <View className="flex-row items-center justify-between px-5 pt-6">
        <IconButton
          icon="x"
          size={IconButtonSize.LG}
          accessibilityLabel="Leave focus"
          onPress={() => router.back()}
        />
        <Text className="type-label text-ink-subtle">FOCUS</Text>
        <View className="size-11" />
      </View>
      {activity && <ActivityCard activity={activity} />}
      <View className="flex-1 items-center justify-center gap-5.5 px-6 pb-10">
        {endedLine !== null ? (
          <Text className="w-70 text-center type-body text-ink-muted">{endedLine}</Text>
        ) : (
          <>
            <FocusRing
              hue={hue}
              fill={fill}
              clock={clockText(remaining)}
              state={timer === null ? 'Ready when you are' : paused ? 'Paused' : 'Focusing'}
              remainingLabel={`${Math.floor(wholeRemaining / 60)} minutes ${wholeRemaining % 60} seconds remaining`}
            />
            {timer === null ? (
              <View className="items-center gap-5.5">
                <View className="flex-row gap-2">
                  {LENGTH_MINUTES.map((minutes) => (
                    <Chip
                      key={minutes}
                      selected={lengthMinutes === minutes}
                      accessibilityLabel={`${minutes} minutes`}
                      onPress={() => setLengthMinutes(minutes)}
                    >
                      {`${minutes}m`}
                    </Chip>
                  ))}
                </View>
                <View className="w-55">
                  <Button icon="play" onPress={beginSession}>
                    Start focus
                  </Button>
                </View>
              </View>
            ) : (
              <View className="items-center gap-5.5">
                <View className="flex-row items-center gap-4.5">
                  <StepButton
                    label="−5"
                    accessibilityLabel="Five minutes less"
                    onPress={adjust(subtractFiveMinutes)}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={paused ? 'Resume' : 'Pause'}
                    onPress={toggleRunning}
                    className="size-19 items-center justify-center rounded-full bg-accent active:opacity-90"
                  >
                    <Icon
                      name={paused ? 'play' : 'pause'}
                      size={28}
                      strokeWidth={2.6}
                      colorClassName="text-on-accent"
                    />
                  </Pressable>
                  <StepButton
                    label="+5"
                    accessibilityLabel="Five minutes more"
                    onPress={adjust(addFiveMinutes)}
                  />
                </View>
                <View>
                  <Chip icon="stop" onPress={endSession}>
                    End session
                  </Chip>
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}
