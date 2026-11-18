import { hueColors } from '@daycraft/design-tokens';
import {
  ACTIVITY_ICONS,
  ActivityHue,
  formatRange,
  formatRelativeDate,
  formatShortDate,
  Label,
  Priority,
  Repeat,
  type Repeat as RepeatPreset,
  type ActivityHue as Hue,
  type IconName,
  type ISODate,
  type Label as LabelName,
  type Priority as PriorityLevel,
  type SubtaskInput,
} from '@daycraft/domain';
import { useState, type ReactNode } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Chip, ChipSize, Icon, IconButton, IconButtonSize, Segmented } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme/app-theme';

const DURATIONS = [
  { value: '15', label: '15m' },
  { value: '30', label: '30m' },
  { value: '45', label: '45m' },
  { value: '60', label: '1h' },
  { value: '90', label: '1.5h' },
  { value: '120', label: '2h' },
] as const;

const PRIORITIES = [
  { value: Priority.NONE, label: 'None' },
  { value: Priority.LOW, label: 'Low' },
  { value: Priority.MEDIUM, label: 'Medium' },
  { value: Priority.HIGH, label: 'High' },
] as const;

const REPEATS = [
  { value: Repeat.NEVER, label: 'Never' },
  { value: Repeat.DAILY, label: 'Daily' },
  { value: Repeat.WEEKDAYS, label: 'Weekdays' },
  { value: Repeat.WEEKLY, label: 'Weekly' },
] as const;

const SCHEDULING = [
  { value: 'timeline', label: 'Timeline' },
  { value: 'anytime', label: 'Anytime' },
] as const;

let nextDraftKey = 0;

const ICON_CELL_WIDTH = `${100 / 6}%` as const;

const HUE_NAMES: Record<Hue, string> = {
  clay: 'Clay',
  amber: 'Amber',
  sun: 'Sun',
  sage: 'Sage',
  pine: 'Pine',
  sky: 'Sky',
  iris: 'Iris',
  rose: 'Rose',
  slate: 'Slate',
};

interface FieldProps {
  label: string;
  /** Sits on the label's row, at the right. */
  aside?: ReactNode;
  children: ReactNode;
}

interface DateRowProps {
  date: ISODate;
  today: ISODate;
  onStep: (days: number) => void;
}

interface TimeFieldProps {
  start: number | null;
  durationMinutes: number;
  /** Tasks can be unscheduled; events can't. */
  canUnschedule: boolean;
  onSchedule: (scheduled: boolean) => void;
  onStep: (minutes: number) => void;
}

interface DurationFieldProps {
  value: number;
  onChange: (minutes: number) => void;
}

interface ColorFieldProps {
  value: Hue;
  onChange: (hue: Hue) => void;
}

interface IconFieldProps {
  value: IconName;
  onChange: (icon: IconName) => void;
}

interface PriorityFieldProps {
  value: PriorityLevel;
  onChange: (priority: PriorityLevel) => void;
}

interface LabelsFieldProps {
  value: LabelName[];
  onChange: (labels: LabelName[]) => void;
}

interface SubtasksFieldProps {
  value: SubtaskInput[];
  onChange: (subtasks: SubtaskInput[]) => void;
}

interface RepeatFieldProps {
  value: RepeatPreset;
}

interface TextFieldProps {
  value: string;
  onChange: (value: string) => void;
}

/** A labelled editor field: 15pt semibold label, then the control. */
export function Field({ label, aside, children }: FieldProps) {
  return (
    <View className="gap-2.5">
      <View className="min-h-8 flex-row items-center justify-between gap-3">
        <Text className="type-body font-sans-semibold text-ink">{label}</Text>
        {aside}
      </View>
      {children}
    </View>
  );
}

/** The date with ‹ › to move the activity a day at a time. */
export function DateRow({ date, today, onStep }: DateRowProps) {
  const relative = formatRelativeDate(date, today);
  const short = formatShortDate(date);
  const label = relative === short ? short : `${relative} · ${short}`;
  return (
    <View className="min-h-13 flex-row items-center gap-3 rounded-card border border-line px-4">
      <Icon name="calendar" size={18} colorClassName="text-ink-subtle" />
      <Text className="flex-1 type-body font-sans-semibold text-ink">{label}</Text>
      <IconButton icon="chev-l" accessibilityLabel="Previous day" onPress={() => onStep(-1)} />
      <IconButton icon="chev-r" accessibilityLabel="Next day" onPress={() => onStep(1)} />
    </View>
  );
}

/** Timeline or Anytime, and the −15 / +15 start stepper (the drag alternative). */
export function TimeField({ start, durationMinutes, canUnschedule, onSchedule, onStep }: TimeFieldProps) {
  return (
    <Field
      label="Time"
      aside={
        canUnschedule && (
          <View className="w-47.5">
            <Segmented
              options={SCHEDULING}
              value={start === null ? 'anytime' : 'timeline'}
              onChange={(value) => onSchedule(value === 'timeline')}
              accessibilityLabel="Scheduling"
            />
          </View>
        )
      }
    >
      {start === null ? (
        <Text className="rounded-field bg-sunken px-4 py-3 type-body-sm text-ink-muted">
          This task will wait in your Tasks list until you place it on the timeline.
        </Text>
      ) : (
        <View className="flex-row items-center justify-between rounded-card bg-sunken p-2">
          <IconButton
            size={IconButtonSize.LG}
            onSunken
            icon="minus"
            accessibilityLabel="15 minutes earlier"
            onPress={() => onStep(-15)}
          />
          <Text
            accessibilityLiveRegion="polite"
            style={{ fontVariant: ['tabular-nums'] }}
            className="type-heading text-ink"
          >
            {formatRange(start, durationMinutes)}
          </Text>
          <IconButton
            size={IconButtonSize.LG}
            onSunken
            icon="plus"
            accessibilityLabel="15 minutes later"
            onPress={() => onStep(15)}
          />
        </View>
      )}
    </Field>
  );
}

export function DurationField({ value, onChange }: DurationFieldProps) {
  return (
    <Field label="Duration">
      <Segmented
        options={DURATIONS}
        value={String(value)}
        onChange={(minutes) => onChange(Number(minutes))}
        accessibilityLabel="Duration"
      />
    </Field>
  );
}

export function ColorField({ value, onChange }: ColorFieldProps) {
  return (
    <Field label="Color">
      <View className="flex-row justify-between">
        {Object.values(ActivityHue).map((hue) => {
          const selected = hue === value;
          return (
            <Pressable
              key={hue}
              accessibilityRole="button"
              accessibilityLabel={HUE_NAMES[hue]}
              accessibilityState={{ selected }}
              hitSlop={4}
              onPress={() => onChange(hue)}
              style={{ backgroundColor: hueColors[hue] }}
              className="size-8 rounded-full"
            >
              {selected && <View className="absolute -inset-1 rounded-full border-2 border-ink" />}
            </Pressable>
          );
        })}
      </View>
    </Field>
  );
}

export function IconField({ value, onChange }: IconFieldProps) {
  return (
    <Field label="Icon">
      <View className="flex-row flex-wrap gap-y-2.5">
        {ACTIVITY_ICONS.map((icon) => {
          const selected = icon === value;
          return (
            <View key={icon} style={{ width: ICON_CELL_WIDTH }} className="items-center">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={icon}
                accessibilityState={{ selected }}
                onPress={() => onChange(icon)}
                className={cn('size-11 items-center justify-center rounded-full', {
                  'bg-sunken': !selected,
                  'bg-accent': selected,
                })}
              >
                <Icon
                  name={icon}
                  size={20}
                  colorClassName={cn({ 'text-ink-muted': !selected, 'text-on-accent': selected })}
                />
              </Pressable>
            </View>
          );
        })}
      </View>
    </Field>
  );
}

export function PriorityField({ value, onChange }: PriorityFieldProps) {
  return (
    <Field label="Priority">
      <Segmented options={PRIORITIES} value={value} onChange={onChange} accessibilityLabel="Priority" />
    </Field>
  );
}

export function LabelsField({ value, onChange }: LabelsFieldProps) {
  return (
    <Field label="Labels">
      <View className="flex-row flex-wrap gap-2">
        {Object.values(Label).map((label) => {
          const selected = value.includes(label);
          return (
            <Chip
              key={label}
              icon="tag"
              selected={selected}
              onPress={() => onChange(selected ? value.filter((item) => item !== label) : [...value, label])}
            >
              {label}
            </Chip>
          );
        })}
      </View>
    </Field>
  );
}

/** Add, rename and remove subtasks. */
export function SubtasksField({ value, onChange }: SubtasksFieldProps) {
  const colors = useThemeColors();
  const [draft, setDraft] = useState('');
  const add = () => {
    const title = draft.trim();
    if (!title) return;
    nextDraftKey += 1;
    // A draft id keeps the row's key stable; the repository gives unknown ids a real id when it saves.
    onChange([...value, { id: `draft-${nextDraftKey}`, title, done: false }]);
    setDraft('');
  };
  return (
    <Field label="Subtasks">
      <View className="overflow-hidden rounded-card border border-line">
        {value.map((subtask, index) => (
          <View key={subtask.id ?? index} className="min-h-12 flex-row items-center gap-3 border-b border-line px-4">
            <View
              className={cn('size-4.5 items-center justify-center rounded-check border-2', {
                'border-line-strong': !subtask.done,
                'border-ink-subtle bg-ink-subtle': subtask.done,
              })}
            >
              {subtask.done && <Icon name="check" size={11} strokeWidth={3.2} colorClassName="text-surface" />}
            </View>
            <TextInput
              accessibilityLabel={`Subtask ${index + 1}`}
              defaultValue={subtask.title}
              onChangeText={(title) => onChange(value.map((item, i) => (i === index ? { ...item, title } : item)))}
              className="h-12 flex-1 type-body text-ink"
              placeholderTextColor={colors['ink-subtle']}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${subtask.title || 'subtask'}`}
              hitSlop={8}
              onPress={() => onChange(value.filter((_, i) => i !== index))}
              className="size-8 items-center justify-center rounded-full"
            >
              <Icon name="x" size={15} colorClassName="text-ink-subtle" />
            </Pressable>
          </View>
        ))}
        <View className="min-h-12 flex-row items-center gap-3 px-4">
          <Icon name="plus" size={18} colorClassName="text-ink-subtle" />
          <TextInput
            accessibilityLabel="New subtask"
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={add}
            // Keep the keyboard up while adding several; an empty submit closes it.
            submitBehavior={draft.trim() ? 'submit' : 'blurAndSubmit'}
            returnKeyType="done"
            placeholder="Add a subtask"
            placeholderTextColor={colors['ink-subtle']}
            className="h-12 flex-1 type-body text-ink"
          />
          <View>
            <Chip size={ChipSize.SM} onPress={add}>
              Add
            </Chip>
          </View>
        </View>
      </View>
    </Field>
  );
}

export function LocationField({ value, onChange }: TextFieldProps) {
  const colors = useThemeColors();
  return (
    <Field label="Location">
      <View className="h-12 flex-row items-center gap-2.5 rounded-field bg-sunken px-4">
        <Icon name="pin" size={18} colorClassName="text-ink-subtle" />
        <TextInput
          accessibilityLabel="Location"
          defaultValue={value}
          onChangeText={onChange}
          placeholder="Add a place or link"
          placeholderTextColor={colors['ink-subtle']}
          className="h-full flex-1 type-body text-ink"
        />
      </View>
    </Field>
  );
}

/** Repeat shows the activity's preset, disabled until repeating activities can be edited. */
export function RepeatField({ value }: RepeatFieldProps) {
  return (
    <Field label="Repeat">
      <Segmented
        options={REPEATS}
        value={value}
        onChange={() => undefined}
        accessibilityLabel="Repeat, not available yet"
        disabled
      />
    </Field>
  );
}

export function NotesField({ value, onChange }: TextFieldProps) {
  const colors = useThemeColors();
  return (
    <Field label="Notes">
      <TextInput
        accessibilityLabel="Notes"
        defaultValue={value}
        onChangeText={onChange}
        multiline
        placeholder="Add details, links or a reminder to self"
        placeholderTextColor={colors['ink-subtle']}
        textAlignVertical="top"
        className="min-h-22 rounded-field bg-sunken px-4 py-3 type-body text-ink"
      />
    </Field>
  );
}
