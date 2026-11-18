import {
  ActivityKind,
  addDays,
  clampToDay,
  DEFAULT_START,
  savedToast,
  validateActivity,
  VALIDATION_MESSAGES,
  type ActivityInput,
  type ISODate,
} from '@daycraft/domain';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Button, Icon, useToast } from '@/components/ui';
import { activityRepository } from '@/data/activity-store';
import { markJustCreated } from '@/features/plan/plan-state';

import { EditorHeader } from './editor-header';
import {
  ColorField,
  DateRow,
  DurationField,
  IconField,
  LabelsField,
  LocationField,
  NotesField,
  PriorityField,
  RepeatField,
  SubtasksField,
  TimeField,
} from './editor-fields';

const ANYTIME_AVAILABLE = false;

interface ActivityEditorProps {
  initial: ActivityInput;
  /** The activity being edited, or null when creating one. */
  activityId: string | null;
  today: ISODate;
}

function primaryLabel(draft: ActivityInput, editing: boolean): string {
  if (editing) return 'Save changes';
  if (draft.kind === ActivityKind.EVENT) return 'Add event';
  return draft.start === null ? 'Add task' : 'Add to timeline';
}

/** The editor sheet for creating and editing tasks and events (interaction patterns, editor). */
export function ActivityEditor({ initial, activityId, today }: ActivityEditorProps) {
  const toast = useToast();
  const [draft, setDraft] = useState(initial);
  // The start to restore when switching from Anytime back to Timeline.
  const [lastStart, setLastStart] = useState(initial.start ?? DEFAULT_START);
  const editing = activityId !== null;
  // Routines edit like tasks: priority, labels and their steps as subtasks.
  const isTask = draft.kind !== ActivityKind.EVENT;
  const change = (changes: Partial<ActivityInput>) => setDraft((current) => ({ ...current, ...changes }));

  const retime = (start: number, durationMinutes: number) => {
    const timing = clampToDay({ start, durationMinutes });
    setLastStart(timing.start);
    change(timing);
  };

  const save = () => {
    const result = validateActivity(draft);
    if (!result.ok) {
      toast(VALIDATION_MESSAGES[result.reason]);
      return;
    }
    const saved = activityId
      ? activityRepository.update(activityId, result.value)
      : activityRepository.create(result.value);
    if (!editing) markJustCreated(saved.id);
    router.back();
    toast(savedToast({ activity: saved, today, created: !editing }));
  };

  const remove = () => {
    if (!activityId) return;
    activityRepository.remove(activityId);
    router.dismissAll();
    toast(`Deleted · ${draft.title || initial.title}`);
  };

  return (
    <View className="flex-1 bg-surface">
      <EditorHeader
        draft={draft}
        onClose={() => router.back()}
        onChangeTitle={(title) => change({ title })}
        onChangeKind={(kind) =>
          // An event always has a time, so switching to Event restores the last start.
          change({ kind, start: kind === ActivityKind.EVENT && draft.start === null ? lastStart : draft.start })
        }
      />
      {/* Native form sheets lay out a direct ScrollView child specially; wrapping it keeps header and footer in place. */}
      <View collapsable={false} className="flex-1">
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          contentContainerClassName="gap-6 px-5 pt-5 pb-6"
        >
          <DateRow date={draft.date} today={today} onStep={(days) => change({ date: addDays(draft.date, days) })} />
          <TimeField
            start={draft.start}
            durationMinutes={draft.durationMinutes}
            // Anytime returns with the Tasks list: until then an unscheduled task would have nowhere to appear.
            canUnschedule={ANYTIME_AVAILABLE && draft.kind === ActivityKind.TASK}
            onSchedule={(scheduled) => change({ start: scheduled ? lastStart : null })}
            onStep={(minutes) => retime((draft.start ?? lastStart) + minutes, draft.durationMinutes)}
          />
          <DurationField
            value={draft.durationMinutes}
            onChange={(minutes) =>
              draft.start === null ? change({ durationMinutes: minutes }) : retime(draft.start, minutes)
            }
          />
          <ColorField value={draft.hue} onChange={(hue) => change({ hue })} />
          <IconField value={draft.icon} onChange={(icon) => change({ icon })} />
          {isTask && <PriorityField value={draft.priority} onChange={(priority) => change({ priority })} />}
          {isTask && <LabelsField value={draft.labels} onChange={(labels) => change({ labels })} />}
          {isTask && <SubtasksField value={draft.subtasks} onChange={(subtasks) => change({ subtasks })} />}
          {draft.kind === ActivityKind.EVENT && (
            <LocationField value={draft.location} onChange={(location) => change({ location })} />
          )}
          <RepeatField value={draft.repeat} />
          <NotesField value={draft.notes} onChange={(notes) => change({ notes })} />
        </ScrollView>
      </View>
      <View collapsable={false} className="flex-row gap-2.5 border-t border-line px-5 pt-3 pb-safe-offset-3">
        {editing && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete"
            onPress={remove}
            className="size-13 items-center justify-center rounded-full bg-sunken active:opacity-70"
          >
            <Icon name="trash" size={19} colorClassName="text-danger" />
          </Pressable>
        )}
        <View className="flex-1">
          <Button onPress={save}>{primaryLabel(draft, editing)}</Button>
        </View>
      </View>
    </View>
  );
}
