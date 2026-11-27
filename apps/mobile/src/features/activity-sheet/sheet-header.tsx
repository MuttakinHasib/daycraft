import { inkOn, withOpacity } from '@daycraft/design-tokens';
import { ActivityKind, formatTimeText, type ActivityInput, type ActivityKind as Kind } from '@daycraft/domain';
import { Pressable, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  bandTextOn,
  colorValue,
  Icon,
  IconButton,
  IconButtonSize,
  popIn,
  Segmented,
  SegmentedTone,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { useColorScheme, useThemeColors } from '@/theme/app-theme';

import { MoreMenu } from './more-menu';
import { BandTile, HueBand } from './sheet-chrome';

const KIND_OPTIONS = [
  { value: ActivityKind.TASK, label: 'Task' },
  { value: ActivityKind.EVENT, label: 'Event' },
] as const;

const TITLE_RULE = 1.5;

interface SheetHeaderProps {
  draft: ActivityInput;
  /** True while creating: Task/Event in place of ⋯, and no check ring. */
  isNew: boolean;
  onClose: () => void;
  onChangeTitle: (title: string) => void;
  onChangeKind: (kind: Kind) => void;
  onToggleDone: () => void;
  onOpenColour: () => void;
  /** Opens Focus on this task. Left out for events: the docs give Start focus to tasks only. */
  onStartFocus?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

/** The band in the activity's hue: ×, ⋯ or Task/Event, the icon capsule, the time, the title and the check ring. */
export function SheetHeader({
  draft,
  isNew,
  onClose,
  onChangeTitle,
  onChangeKind,
  onToggleDone,
  onOpenColour,
  onStartFocus,
  onDuplicate,
  onDelete,
}: SheetHeaderProps) {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  // TextInput takes its text and placeholder colors as values, not classes.
  // On a light custom colour the dark band keeps dark text too.
  const lightColour = inkOn(colorValue(draft.hue)) === 'ink';
  const ink = scheme === 'dark' && !lightColour ? colors['on-hue'] : scheme === 'dark' ? colors.canvas : colors.ink;
  const bandText = bandTextOn(draft.hue);
  // The band is a tint in light mode (and on light custom colours in dark), so white would not reach 3:1
  // against it; the ring takes the band's ink colour there, as the time and title do.
  const bandIsTinted = scheme === 'light' || lightColour;
  // The segmented control has a fixed width that fits its labels at the default size; at accessibility
  // sizes the labels grow past it, so there it takes the free width between × and the spacer instead.
  const { fontScale } = useWindowDimensions();
  const largeType = fontScale >= 1.3;
  const doneSubtasks = draft.subtasks.filter((subtask) => subtask.done).length;
  const timeLabel = draft.start === null ? 'Anytime' : formatTimeText(draft.start, draft.durationMinutes);
  return (
    <HueBand hue={draft.hue}>
      <View className="flex-row items-center justify-between gap-3">
        <IconButton icon="x" size={IconButtonSize.LG} accessibilityLabel="Close" onPress={onClose} />
        {isNew ? (
          <View className={cn(largeType ? 'flex-1' : 'w-47.5')}>
            <Segmented
              options={KIND_OPTIONS}
              value={draft.kind}
              onChange={onChangeKind}
              accessibilityLabel="Type"
              tone={SegmentedTone.ON_HUE}
            />
          </View>
        ) : (
          <MoreMenu onStartFocus={onStartFocus} onDuplicate={onDuplicate} onDelete={onDelete} />
        )}
        {isNew && <View className={cn({ 'size-11': !largeType, 'w-11': largeType })} />}
      </View>
      <View className="mt-4.5 flex-row items-center gap-3.5">
        <BandTile icon={draft.icon} textClass={bandText} onPress={onOpenColour} />
        <View className="min-w-0 flex-1">
          <Text style={{ fontVariant: ['tabular-nums'] }} className={cn('type-meta font-sans-semibold', bandText)}>
            {timeLabel}
          </Text>
          <TextInput
            accessibilityLabel="Title"
            defaultValue={draft.title}
            onChangeText={onChangeTitle}
            autoFocus={isNew && draft.title === ''}
            placeholder={draft.kind === ActivityKind.EVENT ? 'Event name' : 'What do you want to do?'}
            placeholderTextColor={withOpacity(ink, 0.5)}
            returnKeyType="done"
            style={{ borderBottomWidth: TITLE_RULE, color: ink }}
            className={cn('border-on-hue/50 pt-1 pb-1.5 type-heading', { 'line-through': draft.done })}
          />
          {draft.subtasks.length > 0 && (
            <View
              accessible
              accessibilityLabel={`${doneSubtasks} of ${draft.subtasks.length} subtasks done`}
              className="mt-1.5 flex-row items-center gap-1 opacity-80"
            >
              <Icon name="checksq" size={13} colorClassName={bandText} />
              <Text style={{ fontVariant: ['tabular-nums'] }} className={cn('type-meta font-sans-semibold', bandText)}>
                {`${doneSubtasks}/${draft.subtasks.length}`}
              </Text>
            </View>
          )}
        </View>
        {!isNew && (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: draft.done }}
            accessibilityLabel={`${draft.done ? 'Mark not done' : 'Complete'}: ${draft.title}`}
            hitSlop={6}
            onPress={onToggleDone}
            // On a tinted band the ring takes the band's ink colour so it stays visible; on the solid hue
            // it stays on-hue (white), which passes 3:1 there.
            style={bandIsTinted ? { borderColor: ink, backgroundColor: draft.done ? ink : undefined } : undefined}
            className={cn('size-8 items-center justify-center rounded-full border-2', {
              'border-on-hue': !bandIsTinted,
              'bg-on-hue': draft.done && !bandIsTinted,
            })}
          >
            {draft.done && (
              <Animated.View entering={popIn}>
                <Icon
                  name="check"
                  size={17}
                  strokeWidth={3.2}
                  colorClassName={bandIsTinted ? 'text-on-hue' : 'text-ink'}
                />
              </Animated.View>
            )}
          </Pressable>
        )}
      </View>
    </HueBand>
  );
}
