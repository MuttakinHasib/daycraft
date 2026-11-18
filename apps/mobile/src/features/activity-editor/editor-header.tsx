import { withOpacity } from '@daycraft/design-tokens';
import { ActivityKind, formatTimeText, type ActivityInput, type ActivityKind as Kind } from '@daycraft/domain';
import { Text, TextInput, View } from 'react-native';

import { Segmented, SegmentedTone } from '@/components/ui';
import { BAND_TEXT, BandButton, BandTile, BandTileShape, HueBand } from '@/features/activity-sheet/sheet-chrome';
import { cn } from '@/lib/cn';
import { useColorScheme, useThemeColors } from '@/theme/app-theme';

const KIND_OPTIONS = [
  { value: ActivityKind.TASK, label: 'Task' },
  { value: ActivityKind.EVENT, label: 'Event' },
] as const;

const TITLE_RULE = 1.5;

interface EditorHeaderProps {
  draft: ActivityInput;
  onChangeKind: (kind: Kind) => void;
  onChangeTitle: (title: string) => void;
  onClose: () => void;
}

/** The editor's header band in the selected hue: close, Task/Event, the icon and the title. */
export function EditorHeader({ draft, onChangeKind, onChangeTitle, onClose }: EditorHeaderProps) {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  // TextInput takes its text and placeholder colors as values, not classes.
  const ink = scheme === 'dark' ? colors['on-hue'] : colors.ink;
  const timeLabel = draft.start === null ? 'Anytime' : formatTimeText(draft.start, draft.durationMinutes);
  return (
    <HueBand hue={draft.hue}>
      <View className="flex-row items-center justify-between gap-3">
        <BandButton icon="x" accessibilityLabel="Close" onPress={onClose} />
        <View className="w-47.5">
          <Segmented
            options={KIND_OPTIONS}
            value={draft.kind}
            onChange={onChangeKind}
            accessibilityLabel="Type"
            tone={SegmentedTone.ON_HUE}
          />
        </View>
        <View className="size-10" />
      </View>
      <View className="mt-4.5 flex-row items-center gap-3.5">
        <BandTile icon={draft.icon} shape={BandTileShape.CIRCLE} />
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
            placeholder={draft.kind === ActivityKind.EVENT ? 'Event name' : 'What do you want to do?'}
            placeholderTextColor={withOpacity(ink, 0.5)}
            returnKeyType="done"
            style={{ borderBottomWidth: TITLE_RULE, color: ink }}
            className="border-on-hue/50 pt-1 pb-1.5 type-heading"
          />
        </View>
      </View>
    </HueBand>
  );
}
