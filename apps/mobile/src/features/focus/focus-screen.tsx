import { durations } from '@daycraft/design-tokens';
import {
  AMBIENT_SOUNDS,
  AmbientSound,
  ambientSoundName,
  ambientSoundPlaying,
  addFiveMinutes,
  canMarkTaskDone,
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
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import {
  Button,
  ButtonVariant,
  Chip,
  colorValue,
  Icon,
  IconButton,
  IconButtonSize,
  inkClassOn,
  popIn,
} from '@/components/ui';
import { activityRepository, useActivity } from '@/data/activity-store';
import { focusSessionRepository } from '@/data/focus-store';
import { savedFocusSound, saveFocusSound } from '@/features/focus/focus-sound-store';
import {
  clearRunningSession,
  recoverInterruptedSession,
  saveRunningSession,
} from '@/features/focus/running-session-store';
import { useTopInset } from '@/lib/use-top-inset';
import { useThemeColors } from '@/theme/app-theme';

// The setup's offered lengths (the spec's chips); a session opens on the prototype's default.
const LENGTH_MINUTES = [15, 25, 45, 60, 90] as const;
const DEFAULT_LENGTH_MINUTES = 25;
const SECOND_MS = 1_000;

// The bundled loops behind the picker's sounds. Each one's source page and licence line are
// recorded next to the files, in assets/focus-sounds/CREDITS.md; the silent choice has no file.
const SOUND_SOURCES: Record<Exclude<AmbientSound, typeof AmbientSound.NONE>, number> = {
  [AmbientSound.RAIN]: require('../../../assets/focus-sounds/rain.m4a'),
  [AmbientSound.FOREST]: require('../../../assets/focus-sounds/forest.m4a'),
  [AmbientSound.CAFE]: require('../../../assets/focus-sounds/cafe.m4a'),
  [AmbientSound.WAVES]: require('../../../assets/focus-sounds/waves.m4a'),
  [AmbientSound.BROWN_NOISE]: require('../../../assets/focus-sounds/brown-noise.m4a'),
};

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

interface DoneViewProps {
  /** What the 96pt circle is filled with: the activity's hue, or the accent when the session had none. */
  hue: string;
  /** The domain's Done line: the time actually focused and what it focused on. */
  line: string;
  /** Whether **Mark task as done** shows: the domain's rule, already applied to the focused activity. */
  canMarkDone: boolean;
  onMarkDone: () => void;
  onAnotherSession: () => void;
}

/**
 * The Done state (navigation-and-modules, Focus): the 96pt hue circle with a check — the pop the
 * focus-complete badge was given its keyframes for — "Session complete", the domain's Done line,
 * then **Mark task as done** when the task is not done yet and **Another session** back to setup.
 */
function DoneView({ hue, line, canMarkDone, onMarkDone, onAnotherSession }: DoneViewProps) {
  return (
    <Animated.View entering={FadeIn.duration(durations.fadeIn)} className="items-center gap-3.5">
      <Animated.View
        entering={popIn}
        style={{ backgroundColor: hue }}
        className="size-24 items-center justify-center rounded-full"
      >
        <Icon name="check" size={44} strokeWidth={2.6} colorClassName="text-on-hue" />
      </Animated.View>
      <Text accessibilityRole="header" className="type-title text-ink">
        Session complete
      </Text>
      <Text style={TABULAR} className="w-70 text-center type-body text-ink-muted">
        {line}
      </Text>
      <View className="mt-2.5 w-70 gap-2.5">
        {canMarkDone && <Button onPress={onMarkDone}>Mark task as done</Button>}
        <Button variant={ButtonVariant.SECONDARY} onPress={onAnotherSession}>
          Another session
        </Button>
      </View>
    </Animated.View>
  );
}

interface FocusScreenProps {
  /** The activity the session focuses on, or null when it has none (the route without an id). */
  activityId: string | null;
}

/**
 * Focus (navigation-and-modules): the full-screen timer. Setup picks a length and an ambient sound, the run
 * fills the ring with the activity's hue, and ending — by **End session** or by running out — saves the session
 * through the focus repository and shows the Done state: **Mark task as done** reuses the activity repository's
 * toggle, and **Another session** returns to setup. The timer's rules are the domain's, and so is the sound's
 * play rule; the screen holds none of its own.
 */
export function FocusScreen({ activityId }: FocusScreenProps) {
  const colors = useThemeColors();
  const topInset = useTopInset();
  const activity = useActivity(activityId);
  const activityTitle = activity?.title ?? null;
  const [lengthMinutes, setLengthMinutes] = useState<number>(DEFAULT_LENGTH_MINUTES);
  // The picked ambient sound, preselected from the key-value store (the onboarding-flag pattern).
  const [sound, setSound] = useState<AmbientSound>(savedFocusSound);
  // The live session: null in setup, and again once it has ended.
  const [timer, setTimer] = useState<FocusTimer | null>(null);
  const [now, setNow] = useState(() => Date.now());
  // The domain's Done line once the session ended; null while it runs and in setup.
  const [endedLine, setEndedLine] = useState<string | null>(null);
  // Whether the app is in the foreground: the sound pauses when it is not (the spec's rule).
  const [foregrounded, setForegrounded] = useState(AppState.currentState === 'active');

  // One loop player for the screen, created directly rather than with useAudioPlayer: the compiler's
  // immutability rule forbids touching a hook's return, and the loop flag is set once at creation.
  // The ref holds it for the screen's life; the release on unmount is also what stops the sound when
  // the × closes Focus.
  const playerRef = useRef<AudioPlayer | null>(null);
  useEffect(() => {
    const created = createAudioPlayer(null);
    created.loop = true;
    playerRef.current = created;
    return () => {
      created.release();
      playerRef.current = null;
    };
  }, []);

  const paused = timer !== null && timer.pausedAt !== null;
  // In setup the ring shows the chosen length; from Start focus on, the domain decides what is left.
  const remaining = timer === null ? lengthMinutes * 60 : remainingSeconds(timer, now);
  // The ring fills with what has run; in setup nothing is filled yet.
  const fill = timer === null ? 0 : Math.min(1, Math.max(0, 1 - remaining / timer.lengthSeconds));
  const hue = activity ? colorValue(activity.hue) : colors.accent;
  const wholeRemaining = Math.round(remaining);

  // The session the sound follows: a live one, not one already saved to its Done line. The
  // domain's rule then says whether the chosen loop plays — running and foregrounded, never
  // paused, ended, backgrounded, or set to No sound.
  const liveTimer = timer !== null && endedLine === null ? timer : null;
  const soundPlaying = ambientSoundPlaying({ timer: liveTimer, foregrounded, sound });

  // Saving is shared by End session and the session running out. useCallback because the ticking effect
  // depends on it — a referential-identity need, not a reflex.
  const conclude = useCallback(
    (ended: FocusTimer, at: number) => {
      const record = endedSession({ timer: ended, now: at, activityId });
      focusSessionRepository.saveSession(record);
      clearRunningSession();
      setEndedLine(doneLine({ focusedSeconds: record.focusedSeconds, activityTitle }));
    },
    [activityId, activityTitle],
  );

  const beginSession = () => {
    // A session left stored by the × is saved first: starting must never overwrite focused time.
    // Recovery saves and clears in one step, so the new state below is all the store holds.
    recoverInterruptedSession();
    const at = Date.now();
    setNow(at);
    const started = startFocus({ lengthMinutes, now: at });
    setTimer(started);
    saveRunningSession({ timer: started, activityId, recordedAt: at });
    // The chosen loop is loaded here and only here — picking in setup plays nothing. It loops,
    // and playsInSilentMode keeps a chosen session audible past the device's silent switch.
    if (sound !== AmbientSound.NONE && playerRef.current !== null) {
      setAudioModeAsync({ playsInSilentMode: true });
      playerRef.current.replace(SOUND_SOURCES[sound]);
      playerRef.current.loop = true;
    }
  };

  const toggleRunning = () => {
    if (!timer) return;
    const at = Date.now();
    setNow(at);
    const next = timer.pausedAt === null ? pauseFocus(timer, at) : resumeFocus(timer, at);
    setTimer(next);
    saveRunningSession({ timer: next, activityId, recordedAt: at });
  };

  const adjust = (change: (current: FocusTimer, at: number) => FocusTimer) => () => {
    if (!timer) return;
    const at = Date.now();
    setNow(at);
    const next = change(timer, at);
    setTimer(next);
    saveRunningSession({ timer: next, activityId, recordedAt: at });
  };

  const endSession = () => {
    // The endedLine check keeps a press that lands with the timer's own completion from saving twice.
    if (timer && endedLine === null) conclude(timer, Date.now());
  };

  const leaveFocus = () => {
    // Leaving does not end the session (spec): the state stays stored, recorded at the moment of
    // leaving, so a closing that follows recovers the session ended at that moment. The sound
    // stops with the screen; the player's release on unmount backs the pause up.
    if (timer !== null && endedLine === null) {
      saveRunningSession({ timer, activityId, recordedAt: Date.now() });
    }
    playerRef.current?.pause();
    router.back();
  };

  const markTaskDone = () => {
    // The activity repository's own done toggle (spec: not a new code path); then Focus closes.
    if (!activity) return;
    activityRepository.toggleDone(activity.id);
    router.back();
  };

  const anotherSession = () => {
    // Back to setup for the same activity — the route still names it — with the chosen length kept.
    setTimer(null);
    setEndedLine(null);
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

  // Backgrounding must not stop the timer: it counts from its start, and the clock is recomputed on
  // return, so the ring shows the right remaining time at once rather than at the next tick. Leaving
  // the foreground also records the state, so a kill in the background recovers the session ended at
  // that moment, not at its start. The foreground state feeds the sound's rule, which pauses it the
  // moment the app leaves and resumes it only if the session is still running on return.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      setForegrounded(next === 'active');
      if (next === 'active') {
        const at = Date.now();
        setNow(at);
        if (timer !== null && timer.pausedAt === null && endedLine === null && isComplete(timer, at)) {
          conclude(timer, at);
        }
        return;
      }
      if (timer !== null && endedLine === null) {
        saveRunningSession({ timer, activityId, recordedAt: Date.now() });
      }
    });
    return () => subscription.remove();
  }, [timer, activityId, endedLine, conclude]);

  // The sound plays and pauses by the domain's rule alone: while the session runs and the app is
  // foregrounded, and nowhere else. Pause keeps the loop's position, so resuming continues where
  // it stood instead of starting the loop over.
  useEffect(() => {
    const player = playerRef.current;
    if (player === null) return;
    if (soundPlaying) player.play();
    else player.pause();
  }, [soundPlaying]);

  return (
    <View style={{ paddingTop: topInset }} className="flex-1 bg-canvas">
      <View className="flex-row items-center justify-between px-5 pt-6">
        <IconButton
          icon="x"
          size={IconButtonSize.LG}
          accessibilityLabel="Leave focus"
          onPress={leaveFocus}
        />
        <Text className="type-label text-ink-subtle">FOCUS</Text>
        <View className="size-11" />
      </View>
      {activity && <ActivityCard activity={activity} />}
      <View className="flex-1 items-center justify-center gap-5.5 px-6 pb-10">
        {endedLine !== null ? (
          <DoneView
            hue={hue}
            line={endedLine}
            canMarkDone={canMarkTaskDone(activity)}
            onMarkDone={markTaskDone}
            onAnotherSession={anotherSession}
          />
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
                <View className="flex-row flex-wrap justify-center gap-2">
                  {[AmbientSound.NONE, ...AMBIENT_SOUNDS].map((choice) => (
                    <Chip
                      key={choice}
                      selected={sound === choice}
                      accessibilityLabel={`Ambient sound: ${ambientSoundName(choice)}`}
                      onPress={() => {
                        setSound(choice);
                        saveFocusSound(choice);
                      }}
                    >
                      {ambientSoundName(choice)}
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
