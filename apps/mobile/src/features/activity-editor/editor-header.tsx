import { hueColors, sheetHeaderTint, withOpacity } from '@daycraft/design-tokens';
import { ActivityKind, formatTimeText, type ActivityInput, type ActivityKind as Kind } from '@daycraft/domain';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Icon, Segmented, SegmentedTone } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useColorScheme, useThemeColors } from '@/theme/app-theme';

const KIND_OPTIONS = [
  { value: ActivityKind.TASK, label: 'Task' },
  { value: ActivityKind.EVENT, label: 'Event' },
] as const;

// Light: the hue at 40% over the canvas with ink text. Dark: the solid hue with on-hue text.
const HEADER_TEXT = 'text-ink dark:text-on-hue';
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
  const hue = hueColors[draft.hue];
  const ink = scheme === 'dark' ? colors['on-hue'] : colors.ink;
  const timeLabel = draft.start === null ? 'Anytime' : formatTimeText(draft.start, draft.durationMinutes);
  return (
    <View collapsable={false} className="bg-canvas">
      <View style={{ backgroundColor: withOpacity(hue, sheetHeaderTint[scheme]) }} className="px-5 pt-4 pb-6">
        <View className="flex-row items-center justify-between gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            style={{ backgroundColor: withOpacity(colors.ink, 0.08) }}
            className="size-10 items-center justify-center rounded-full active:opacity-70"
          >
            <Icon name="x" size={18} colorClassName={HEADER_TEXT} />
          </Pressable>
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
          <View
            style={{
              backgroundColor: withOpacity(colors.ink, 0.08),
              borderColor: withOpacity(colors['on-hue'], 0.55),
            }}
            className="size-14 items-center justify-center rounded-full border-2"
          >
            <Icon name={draft.icon} size={25} colorClassName={HEADER_TEXT} />
          </View>
          <View className="min-w-0 flex-1">
            <Text
              style={{ fontVariant: ['tabular-nums'] }}
              className={cn('type-meta font-sans-semibold opacity-90', HEADER_TEXT)}
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
              style={{
                borderBottomWidth: TITLE_RULE,
                borderBottomColor: withOpacity(colors['on-hue'], 0.5),
                color: ink,
              }}
              className="pt-1 pb-1.5 type-heading"
            />
          </View>
        </View>
      </View>
    </View>
  );
}
