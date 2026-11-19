import { hueColors } from '@daycraft/design-tokens';
import type { ActivityHue, IconName, SubtaskInput } from '@daycraft/domain';
import { useState, type ReactNode } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { ActivityHueText, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme/app-theme';

const TABULAR = { fontVariant: ['tabular-nums' as const] };
// iOS draws a single-line field's text below center when it has a line height; 0 leaves the font's own.
const ONE_LINE_FIELD = { lineHeight: 0 };

let nextDraftKey = 0;

interface RowProps {
  icon: IconName;
  hue: ActivityHue;
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
  swatch?: ActivityHue;
  /** Shown but not tappable yet, such as Repeat before repeating activities exist. */
  disabled?: boolean;
  accessibilityLabel: string;
}

interface SubtasksNotesCardProps {
  hue: ActivityHue;
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
      <Icon name={icon} size={22} colorClassName={ActivityHueText[hue]} />
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
        <View style={{ backgroundColor: hueColors[swatch] }} className="size-4.5 rounded-full" />
      ) : (
        <Icon name={icon} size={17} colorClassName="text-ink-muted" />
      )}
      <Text numberOfLines={1} className="max-w-40 type-control font-sans-medium text-ink">
        {label}
      </Text>
    </Pressable>
  );
}

/** Tickable, renamable subtasks, an Add subtask field, a hairline, then the notes. */
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
  const [adding, setAdding] = useState('');
  const add = () => {
    const title = adding.trim();
    if (!title) return;
    nextDraftKey += 1;
    // A draft id keeps the row's key stable; the repository gives unknown ids a real id when it saves.
    onChangeSubtasks([...subtasks, { id: `draft-${nextDraftKey}`, title, done: false }]);
    setAdding('');
  };
  return (
    <Card>
      {showSubtasks &&
        subtasks.map((subtask, index) => (
          <View
            key={subtask.id ?? `copy-${index}`}
            className="min-h-12 flex-row items-center gap-3 border-b border-line pl-4"
          >
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: subtask.done }}
              accessibilityLabel={subtask.title}
              hitSlop={10}
              onPress={() => onToggleSubtask(index)}
              style={{
                borderColor: hueColors[hue],
                backgroundColor: subtask.done ? hueColors[hue] : undefined,
              }}
              className="size-5 items-center justify-center rounded-check border-2"
            >
              {subtask.done && <Icon name="check" size={12} strokeWidth={3.2} colorClassName="text-on-hue" />}
            </Pressable>
            <TextInput
              accessibilityLabel={`Subtask ${index + 1}`}
              defaultValue={subtask.title}
              onChangeText={(title) =>
                onChangeSubtasks(subtasks.map((item, i) => (i === index ? { ...item, title } : item)))
              }
              style={ONE_LINE_FIELD}
              className={cn('h-12 flex-1 type-body', {
                'text-ink': !subtask.done,
                'text-ink-muted line-through': subtask.done,
              })}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${subtask.title || 'subtask'}`}
              hitSlop={8}
              onPress={() => onChangeSubtasks(subtasks.filter((_, i) => i !== index))}
              className="size-11 items-center justify-center"
            >
              <Icon name="x" size={15} colorClassName="text-ink-subtle" />
            </Pressable>
          </View>
        ))}
      {showSubtasks && (
        <View className="min-h-12 flex-row items-center gap-3 border-b border-line px-4">
          <View className="size-5 rounded-check border-2 border-line-strong" />
          <TextInput
            accessibilityLabel="Add subtask"
            value={adding}
            onChangeText={setAdding}
            onSubmitEditing={add}
            // Return keeps the keyboard up to add the next one; an empty Return closes it.
            submitBehavior={adding.trim() ? 'submit' : 'blurAndSubmit'}
            returnKeyType="next"
            placeholder="Add subtask"
            placeholderTextColor={colors['ink-subtle']}
            style={ONE_LINE_FIELD}
            className="h-12 flex-1 type-body text-ink"
          />
        </View>
      )}
      <TextInput
        accessibilityLabel="Notes"
        defaultValue={notes}
        onChangeText={onChangeNotes}
        multiline
        placeholder="Add notes, links or a reminder to self"
        placeholderTextColor={colors['ink-subtle']}
        textAlignVertical="top"
        className="min-h-28 px-4 py-3.5 type-body text-ink"
      />
    </Card>
  );
}
