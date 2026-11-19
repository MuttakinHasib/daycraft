import type { ActivityColor, IconName, SubtaskInput } from '@daycraft/domain';
import { useRef, useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { colorValue, Icon, inkClassOn, strokeColor } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme/app-theme';

const TABULAR = { fontVariant: ['tabular-nums' as const] };
// iOS draws a single-line field's text below center when it has a line height; 0 leaves the font's own.
const ONE_LINE_FIELD = { lineHeight: 0 };

let nextDraftKey = 0;

interface RowProps {
  icon: IconName;
  hue: ActivityColor;
  value: string;
  /** Muted text before the chevron, such as "Today" or "2 hr". */
  hint?: string;
  accessibilityLabel: string;
  onPress: () => void;
  first?: boolean;
}

interface PillProps {
  icon: IconName;
  label: string;
  onPress?: () => void;
  /** A dot in this colour in place of the icon (the Colour pill). */
  swatch?: ActivityColor;
  /** Shown but not tappable yet, such as Repeat before repeating activities exist. */
  disabled?: boolean;
  accessibilityLabel: string;
}

interface SubtasksNotesCardProps {
  hue: ActivityColor;
  /** Events have notes but no subtasks. */
  showSubtasks: boolean;
  subtasks: SubtaskInput[];
  notes: string;
  onChangeSubtasks: (subtasks: SubtaskInput[]) => void;
  onToggleSubtask: (index: number) => void;
  onChangeNotes: (notes: string) => void;
}

interface CardProps {
  children: ReactNode;
}

interface LabelProps {
  children: string;
}

/** A light card holding a group of rows. */
export function Card({ children }: CardProps) {
  return <View className="overflow-hidden rounded-card bg-card">{children}</View>;
}

/** A 56pt row: a 22pt icon in the activity's hue, the value, a muted hint and a chevron. */
export function Row({ icon, hue, value, hint, accessibilityLabel, onPress, first = false }: RowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="h-14 flex-row items-center gap-3.5 pl-4 active:bg-sunken"
    >
      <Icon name={icon} size={22} color={strokeColor(hue)} />
      <View className={cn('h-full flex-1 flex-row items-center gap-2 pr-4', { 'border-t border-line': !first })}>
        <Text style={TABULAR} numberOfLines={1} className="flex-1 type-body font-sans-medium text-ink">
          {value}
        </Text>
        {hint && <Text className="type-body text-ink-muted">{hint}</Text>}
        <Icon name="chev-r" size={16} colorClassName="text-ink-subtle" />
      </View>
    </Pressable>
  );
}

/** A 48pt pill for a setting with a few values: Repeat, Priority, Colour, Location. */
export function Pill({ icon, label, onPress, swatch, disabled = false, accessibilityLabel }: PillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cn('h-12 flex-row items-center gap-2 rounded-full bg-card px-4 active:opacity-70', {
        'opacity-60': disabled,
      })}
    >
      {swatch ? (
        <View style={{ backgroundColor: colorValue(swatch) }} className="size-4.5 rounded-full" />
      ) : (
        <Icon name={icon} size={17} colorClassName="text-ink-muted" />
      )}
      <Text numberOfLines={1} className="max-w-40 type-control font-sans-medium text-ink">
        {label}
      </Text>
    </Pressable>
  );
}

/** A small section label inside a card. */
function CardLabel({ children }: LabelProps) {
  return <Text className="px-4 pt-3.5 pb-1 type-meta font-sans-semibold text-ink-subtle">{children}</Text>;
}

interface SubtaskRowProps {
  /** Null for the trailing "Add subtask" row. */
  subtask: SubtaskInput | null;
  index: number;
  hue: ActivityColor;
  onType: (text: string) => void;
  onToggle: () => void;
  onRemove: () => void;
  onReturn: () => void;
  inputRef?: Ref<ComponentRef<typeof TextInput>>;
}

/**
 * One subtask row, or the "Add subtask" row when `subtask` is null. Both render the same element tree, so when the
 * add row turns into a subtask (same key) React keeps its text field: the cursor and the typed text stay put.
 */
function SubtaskRow({ subtask, index, hue, onType, onToggle, onRemove, onReturn, inputRef }: SubtaskRowProps) {
  const colors = useThemeColors();
  const color = colorValue(hue);
  const isAdd = subtask === null;
  const done = subtask?.done ?? false;
  return (
    <View className="min-h-12 flex-row items-center gap-3 border-b border-line pl-4">
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done, disabled: isAdd }}
        accessibilityLabel={subtask?.title ?? 'New subtask'}
        disabled={isAdd}
        hitSlop={10}
        onPress={onToggle}
        style={{
          borderColor: isAdd ? colors['line-strong'] : strokeColor(hue),
          backgroundColor: done ? color : undefined,
        }}
        className="size-5 items-center justify-center rounded-check border-2"
      >
        {done && <Icon name="check" size={12} strokeWidth={3.2} colorClassName={inkClassOn(hue)} />}
      </Pressable>
      <TextInput
        ref={inputRef}
        accessibilityLabel={isAdd ? 'Add subtask' : `Subtask ${index + 1}`}
        defaultValue={subtask?.title}
        onChangeText={onType}
        onSubmitEditing={onReturn}
        // Return on a subtask goes on to the add row; Return on the empty add row closes the keyboard.
        submitBehavior={isAdd ? 'blurAndSubmit' : 'submit'}
        returnKeyType={isAdd ? 'done' : 'next'}
        placeholder="Add subtask"
        placeholderTextColor={colors['ink-subtle']}
        style={ONE_LINE_FIELD}
        className={cn('h-12 flex-1 type-body', {
          'text-ink': !done,
          'text-ink-muted line-through': done,
        })}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${subtask?.title || 'subtask'}`}
        accessibilityElementsHidden={isAdd}
        disabled={isAdd}
        hitSlop={8}
        onPress={onRemove}
        className={cn('size-11 items-center justify-center', { 'opacity-0': isAdd })}
      >
        <Icon name="x" size={15} colorClassName="text-ink-subtle" />
      </Pressable>
    </View>
  );
}

/** A fresh key for the next add row; it becomes the subtask's draft id once something is typed. */
function nextAddKey(): string {
  nextDraftKey += 1;
  return `draft-${nextDraftKey}`;
}

/**
 * Subtasks and notes in one card, each under a small label. Typing in "Add subtask" turns that row into a subtask
 * and a fresh "Add subtask" row appears below it; Return moves to that row; an empty Return closes the keyboard.
 * Ticks save at once (handled by the sheet); the rest waits for Update.
 */
export function SubtasksNotesCard({
  hue,
  showSubtasks,
  subtasks,
  notes,
  onChangeSubtasks,
  onToggleSubtask,
  onChangeNotes,
}: SubtasksNotesCardProps) {
  const colors = useThemeColors();
  const addRef = useRef<ComponentRef<typeof TextInput>>(null);
  // The add row's key; the repository gives unknown ids a real id when it saves.
  const [addKey, setAddKey] = useState(nextAddKey);
  const keyOf = (subtask: SubtaskInput, index: number) => subtask.id ?? `row-${index}`;

  return (
    <Card>
      {showSubtasks && (
        <>
          <CardLabel>Subtasks</CardLabel>
          {/* One list, so the add row keeps its key (and its text field) when it becomes a subtask. */}
          {[
            ...subtasks.map((subtask, index) => (
              <SubtaskRow
                key={keyOf(subtask, index)}
                subtask={subtask}
                index={index}
                hue={hue}
                onType={(title) =>
                  onChangeSubtasks(subtasks.map((item, i) => (i === index ? { ...item, title } : item)))
                }
                onToggle={() => onToggleSubtask(index)}
                onRemove={() => onChangeSubtasks(subtasks.filter((_, i) => i !== index))}
                onReturn={() => addRef.current?.focus()}
              />
            )),
            <SubtaskRow
              key={addKey}
              subtask={null}
              index={subtasks.length}
              hue={hue}
              inputRef={addRef}
              onType={(title) => {
                if (!title) return;
                onChangeSubtasks([...subtasks, { id: addKey, title, done: false }]);
                setAddKey(nextAddKey());
              }}
              onToggle={() => undefined}
              onRemove={() => undefined}
              onReturn={() => undefined}
            />,
          ]}
        </>
      )}
      <CardLabel>Notes</CardLabel>
      <TextInput
        accessibilityLabel="Notes"
        defaultValue={notes}
        onChangeText={onChangeNotes}
        multiline
        placeholder="Add notes, meeting links or phone numbers"
        placeholderTextColor={colors['ink-subtle']}
        textAlignVertical="top"
        className="min-h-24 px-4 pt-1 pb-3.5 type-body text-ink"
      />
    </Card>
  );
}
