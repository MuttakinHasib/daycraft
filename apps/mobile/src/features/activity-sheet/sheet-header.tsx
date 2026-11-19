import { withOpacity } from '@daycraft/design-tokens';
import { ActivityKind, formatTimeText, type ActivityInput, type ActivityKind as Kind } from '@daycraft/domain';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon, popIn, Segmented, SegmentedTone } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useColorScheme, useThemeColors } from '@/theme/app-theme';

import { MoreMenu } from './more-menu';
import { BAND_TEXT, BandButton, BandTile, HueBand } from './sheet-chrome';

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
  onDuplicate,
  onDelete,
}: SheetHeaderProps) {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  // TextInput takes its text and placeholder colors as values, not classes.
  const ink = scheme === 'dark' ? colors['on-hue'] : colors.ink;
  const timeLabel = draft.start === null ? 'Anytime' : formatTimeText(draft.start, draft.durationMinutes);
  return (
    <HueBand hue={draft.hue}>
      <View className="flex-row items-center justify-between gap-3">
        <BandButton icon="x" accessibilityLabel="Close" onPress={onClose} />
        {isNew ? (
          <View className="w-47.5">
            <Segmented
              options={KIND_OPTIONS}
              value={draft.kind}
              onChange={onChangeKind}
              accessibilityLabel="Type"
              tone={SegmentedTone.ON_HUE}
            />
          </View>
        ) : (
          <MoreMenu onDuplicate={onDuplicate} onDelete={onDelete} />
        )}
        {isNew && <View className="size-10" />}
      </View>
      <View className="mt-4.5 flex-row items-center gap-3.5">
        <BandTile icon={draft.icon} onPress={onOpenColour} />
        <View className="min-w-0 flex-1">
          <Text
            style={{ fontVariant: ['tabular-nums'] }}
            className={cn('type-meta font-sans-semibold opacity-90', BAND_TEXT)}
          >
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
        </View>
        {!isNew && (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: draft.done }}
            accessibilityLabel={`${draft.done ? 'Mark not done' : 'Complete'}: ${draft.title}`}
            hitSlop={6}
            onPress={onToggleDone}
            className={cn('size-8 items-center justify-center rounded-full border-2 border-on-hue', {
              'bg-on-hue': draft.done,
            })}
          >
            {draft.done && (
              <Animated.View entering={popIn}>
                <Icon name="check" size={17} strokeWidth={3.2} colorClassName="text-ink" />
              </Animated.View>
            )}
          </Pressable>
        )}
      </View>
    </HueBand>
  );
}
