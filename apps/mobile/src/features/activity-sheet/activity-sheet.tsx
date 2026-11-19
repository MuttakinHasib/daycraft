import { durations } from '@daycraft/design-tokens';
import {
  ActivityKind,
  draftChanged,
  formatClock,
  formatDuration,
  formatRange,
  formatRelativeDate,
  formatShortDate,
  Priority,
  savedToast,
  validateActivity,
  VALIDATION_MESSAGES,
  type Activity,
  type ActivityInput,
  type ISODate,
} from '@daycraft/domain';
import { router, usePreventRemove } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActionSheetIOS, Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  SlideInDown,
  SlideOutDown,
  useAnimatedKeyboard,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, useToast } from '@/components/ui';
import { activityRepository } from '@/data/activity-store';
import { markJustCreated } from '@/features/plan/plan-state';

import { ColourSheet, DateSheet, HUE_NAMES, LocationSheet, PRIORITY_LABEL, PrioritySheet } from './option-sheets';
import { Card, Pill, Row, SubtasksNotesCard } from './sheet-body';
import { SheetHeader } from './sheet-header';
import { SubSheet } from './sub-sheet';
import { TimeSheet } from './time-sheet';

const REPEAT_LABEL: Record<ActivityInput['repeat'], string> = {
  never: 'Repeat',
  daily: 'Every day',
  weekdays: 'Weekdays',
  weekly: 'Every week',
};

// Save floats this far above the bottom safe area.
const SAVE_LIFT = 30;

const Panel = {
  DATE: 'date',
  TIME: 'time',
  PRIORITY: 'priority',
  COLOUR: 'colour',
  LOCATION: 'location',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
type Panel = (typeof Panel)[keyof typeof Panel];

interface ActivitySheetProps {
  initial: ActivityInput;
  /** The activity shown, or null when creating one. */
  activityId: string | null;
  today: ISODate;
}

function primaryLabel(draft: ActivityInput, isNew: boolean): string {
  if (!isNew) return 'Save changes';
  if (draft.kind === ActivityKind.EVENT) return 'Add event';
  return draft.start === null ? 'Add task' : 'Add to timeline';
}

interface RowText {
  value: string;
  hint?: string;
}

function timeRow(draft: ActivityInput): RowText {
  if (draft.start === null) return { value: 'Anytime' };
  if (draft.durationMinutes === 0) return { value: formatClock(draft.start) };
  return { value: formatRange(draft.start, draft.durationMinutes), hint: formatDuration(draft.durationMinutes) };
}

// Completing an activity also ticks its subtasks; copy those ticks onto a list by subtask id.
function withTicks(subtasks: ActivityInput['subtasks'], from: Activity['subtasks']): ActivityInput['subtasks'] {
  const done = new Map(from.map((subtask) => [subtask.id, subtask.done]));
  return subtasks.map((subtask) => ({
    ...subtask,
    done: subtask.id === undefined ? subtask.done : (done.get(subtask.id) ?? subtask.done),
  }));
}

function confirmDiscard(onDiscard: () => void) {
  const message = 'You have unsaved changes.';
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      { message, options: ['Discard changes', 'Keep editing'], destructiveButtonIndex: 0, cancelButtonIndex: 1 },
      (index) => index === 0 && onDiscard(),
    );
    return;
  }
  Alert.alert('', message, [
    { text: 'Keep editing', style: 'cancel' },
    { text: 'Discard changes', style: 'destructive', onPress: onDiscard },
  ]);
}

/**
 * The activity sheet (interaction patterns): opens ready to edit, saves only what changed, and creates new
 * activities. Completion and subtask ticks save at once; everything else waits for Save, which closes the sheet.
 */
export function ActivitySheet({ initial, activityId, today }: ActivitySheetProps) {
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();
  // While typing, Save steps aside: floating above the keyboard it would cover the field being edited.
  // It slides back when the keyboard goes down.
  const saveLift = useAnimatedStyle(() => {
    const typing = keyboard.height.value > 0;
    return {
      paddingBottom: insets.bottom + SAVE_LIFT,
      opacity: withTiming(typing ? 0 : 1, { duration: durations.press }),
      transform: [{ translateY: withTiming(typing ? 24 : 0, { duration: durations.press }) }],
    };
  });
  const isNew = activityId === null;
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [panel, setPanel] = useState<Panel | null>(null);
  // Set once saving or deleting is done, so leaving skips the unsaved-changes question.
  const [leaving, setLeaving] = useState(false);
  const dirty = draftChanged(saved, draft);
  const isEvent = draft.kind === ActivityKind.EVENT;
  const change = (changes: Partial<ActivityInput>) => setDraft((current) => ({ ...current, ...changes }));
  const closePanel = () => setPanel(null);

  // Discard drops the guard and leaves; re-dispatching the blocked action would only ask again.
  usePreventRemove(dirty && !leaving, () => confirmDiscard(() => setLeaving(true)));
  useEffect(() => {
    if (leaving) router.back();
  }, [leaving]);

  const save = () => {
    const result = validateActivity(draft);
    if (!result.ok) {
      toast(VALIDATION_MESSAGES[result.reason]);
      return;
    }
    const written = activityId
      ? activityRepository.update(activityId, result.value)
      : activityRepository.create(result.value);
    if (isNew) markJustCreated(written.id);
    toast(savedToast({ activity: written, today, created: isNew }));
    setLeaving(true);
  };

  const toggleDone = () => {
    if (!activityId) return;
    const toggled = activityRepository.toggleDone(activityId);
    setSaved((current) => ({
      ...current,
      done: toggled.done,
      subtasks: withTicks(current.subtasks, toggled.subtasks),
    }));
    setDraft((current) => ({
      ...current,
      done: toggled.done,
      subtasks: withTicks(current.subtasks, toggled.subtasks),
    }));
    toast(toggled.done ? `Done · ${toggled.title}` : 'Marked as not done');
  };

  const toggleSubtask = (index: number) => {
    const subtask = draft.subtasks[index];
    if (!subtask) return;
    const flip = (list: ActivityInput['subtasks']) =>
      list.map((item) => (item.id === subtask.id ? { ...item, done: !item.done } : item));
    // A subtask that is already saved ticks at once; a new one waits for Save with the rest.
    const isSaved = activityId !== null && saved.subtasks.some((item) => item.id === subtask.id);
    if (isSaved && subtask.id) {
      activityRepository.toggleSubtask(subtask.id);
      setSaved((current) => ({ ...current, subtasks: flip(current.subtasks) }));
    }
    setDraft((current) => ({
      ...current,
      subtasks: isSaved
        ? flip(current.subtasks)
        : current.subtasks.map((item, i) => (i === index ? { ...item, done: !item.done } : item)),
    }));
  };

  const remove = () => {
    if (!activityId) return;
    const noun = isEvent ? 'event' : 'task';
    Alert.alert(`Delete “${saved.title}”?`, 'This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: `Delete ${noun}`,
        style: 'destructive',
        onPress: () => {
          activityRepository.remove(activityId);
          toast(`Deleted · ${saved.title}`);
          setLeaving(true);
        },
      },
    ]);
  };

  const duplicate = () => {
    if (activityId) router.replace({ pathname: '/activity/new', params: { from: activityId } });
  };

  const relative = formatRelativeDate(draft.date, today);
  const short = formatShortDate(draft.date);
  const time = timeRow(draft);
  const showSave = isNew || dirty;

  return (
    <View className="flex-1 bg-surface">
      <SheetHeader
        draft={draft}
        isNew={isNew}
        onClose={() => router.back()}
        onChangeTitle={(title) => change({ title })}
        onChangeKind={(kind) =>
          change({
            kind,
            start: kind === ActivityKind.EVENT && draft.start === null ? (saved.start ?? 540) : draft.start,
          })
        }
        onToggleDone={toggleDone}
        onOpenColour={() => setPanel(Panel.COLOUR)}
        onDuplicate={duplicate}
        onDelete={remove}
      />
      {/* Native form sheets lay out a direct ScrollView child specially; wrapping it keeps the header in place. */}
      <View collapsable={false} className="flex-1">
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          // Dragging the content down closes the keyboard, which brings Save back.
          keyboardDismissMode="interactive"
          contentContainerClassName="gap-3 px-5 pt-5 pb-32"
        >
          <Card>
            <Row
              first
              icon="calendar"
              hue={draft.hue}
              value={short}
              hint={relative === short ? undefined : relative}
              accessibilityLabel={`Date, ${relative === short ? short : `${relative}, ${short}`}`}
              onPress={() => setPanel(Panel.DATE)}
            />
            <Row
              icon="clock"
              hue={draft.hue}
              value={time.value}
              hint={time.hint}
              accessibilityLabel={`Time, ${time.value}${time.hint ? `, ${time.hint}` : ''}`}
              onPress={() => draft.start !== null && setPanel(Panel.TIME)}
            />
          </Card>
          <View className="flex-row flex-wrap gap-2">
            <Pill
              icon="repeat"
              label={REPEAT_LABEL[draft.repeat]}
              disabled
              accessibilityLabel={`Repeat: ${draft.repeat === 'never' ? 'never' : REPEAT_LABEL[draft.repeat]}. Not available yet`}
            />
            {isEvent ? (
              <Pill
                icon="pin"
                label={draft.location || 'Location'}
                accessibilityLabel={`Location${draft.location ? `: ${draft.location}` : ''}`}
                onPress={() => setPanel(Panel.LOCATION)}
              />
            ) : (
              <Pill
                icon="flag"
                label={draft.priority === Priority.NONE ? 'Priority' : PRIORITY_LABEL[draft.priority]}
                accessibilityLabel={`Priority: ${PRIORITY_LABEL[draft.priority]}`}
                onPress={() => setPanel(Panel.PRIORITY)}
              />
            )}
            <Pill
              icon="spark"
              swatch={draft.hue}
              label="Colour"
              accessibilityLabel={`Colour and icon: ${HUE_NAMES[draft.hue]}`}
              onPress={() => setPanel(Panel.COLOUR)}
            />
          </View>
          <SubtasksNotesCard
            hue={draft.hue}
            showSubtasks={!isEvent}
            subtasks={draft.subtasks}
            notes={draft.notes}
            onChangeSubtasks={(subtasks) => change({ subtasks })}
            onToggleSubtask={toggleSubtask}
            onChangeNotes={(notes) => change({ notes })}
          />
          {!isNew && (
            <Pressable
              accessibilityRole="button"
              onPress={remove}
              className="mt-3 h-14 items-center justify-center rounded-card bg-card active:opacity-70"
            >
              <Text className="type-body font-sans-semibold text-danger">
                {isEvent ? 'Delete event' : 'Delete task'}
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
      {showSave && (
        <Animated.View
          entering={isNew ? undefined : SlideInDown}
          exiting={SlideOutDown}
          pointerEvents="box-none"
          style={saveLift}
          className="absolute inset-x-0 bottom-0 px-5"
        >
          <Button disabled={draft.title.trim() === ''} onPress={save}>
            {primaryLabel(draft, isNew)}
          </Button>
        </Animated.View>
      )}
      {panel && (
        <SubSheet onClose={closePanel}>
          {panel === Panel.DATE && (
            <DateSheet
              date={draft.date}
              today={today}
              onPick={(date) => {
                change({ date });
                closePanel();
              }}
              onClose={closePanel}
            />
          )}
          {panel === Panel.TIME && draft.start !== null && (
            <TimeSheet
              timing={{ start: draft.start, durationMinutes: draft.durationMinutes }}
              onChange={change}
              onClose={closePanel}
            />
          )}
          {panel === Panel.PRIORITY && (
            <PrioritySheet
              value={draft.priority}
              onPick={(priority) => {
                change({ priority });
                closePanel();
              }}
              onClose={closePanel}
            />
          )}
          {panel === Panel.COLOUR && (
            <ColourSheet hue={draft.hue} icon={draft.icon} onChange={change} onClose={closePanel} />
          )}
          {panel === Panel.LOCATION && (
            <LocationSheet
              value={draft.location}
              onDone={(location) => {
                change({ location });
                closePanel();
              }}
              onClose={closePanel}
            />
          )}
        </SubSheet>
      )}
    </View>
  );
}
