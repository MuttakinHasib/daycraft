import { hueColors } from '@daycraft/design-tokens';
import { formatDuration, IDEAS, isActivityHue, type OnboardingIdea } from '@daycraft/domain';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme/app-theme';

const ENTER_MS = 280;
const IDEA_STAGGER = 30;
// iOS draws a single-line field's text below center when it has a line height; 0 leaves the font's own.
const ONE_LINE_FIELD = { lineHeight: 0 };

interface IdeaChipProps {
  idea: OnboardingIdea;
  selected: boolean;
  index: number;
  onPress: () => void;
}

/** An idea: icon in its hue, the title and its length. Picking one sets all four on the task. */
function IdeaChip({ idea, selected, index, onPress }: IdeaChipProps) {
  const reduceMotion = useReducedMotion();
  const hue = isActivityHue(idea.hue) ? hueColors[idea.hue] : idea.hue;
  return (
    <Animated.View entering={reduceMotion ? undefined : FadeIn.delay(160 + index * IDEA_STAGGER).duration(ENTER_MS)}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${idea.title}, ${formatDuration(idea.durationMinutes)}`}
        hitSlop={4}
        onPress={onPress}
        className={cn('h-9 flex-row items-center gap-1.5 rounded-full px-4 active:opacity-85', {
          'bg-sunken': !selected,
          'bg-ink': selected,
        })}
      >
        <Icon
          name={idea.icon}
          size={15}
          color={selected ? undefined : hue}
          colorClassName={selected ? 'text-canvas' : undefined}
        />
        <Text
          className={cn('type-control font-sans-semibold', { 'text-ink-muted': !selected, 'text-canvas': selected })}
        >
          {idea.title}
        </Text>
        <Text
          style={{ fontVariant: ['tabular-nums'] }}
          className={cn('type-control opacity-70', { 'text-ink-muted': !selected, 'text-canvas': selected })}
        >
          {formatDuration(idea.durationMinutes)}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

interface OneThingProps {
  title: string;
  onChangeTitle: (title: string) => void;
  onPickIdea: (title: string) => void;
  onSubmit: () => void;
}

/** One thing: the capture pill and the idea chips (canvas "v3 · Onboarding", step One thing). */
export function OneThing({ title, onChangeTitle, onPickIdea, onSubmit }: OneThingProps) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const hasTitle = title.trim().length > 0;
  return (
    <View className="px-5 pt-6">
      <Animated.View
        entering={reduceMotion ? undefined : FadeIn.delay(80).duration(ENTER_MS)}
        className={cn('h-12 flex-row items-center gap-2.5 rounded-full border bg-surface pr-1.5 pl-4', {
          'border-line': !hasTitle,
          'border-accent': hasTitle,
        })}
      >
        <Icon name="spark" size={18} colorClassName="text-ink-subtle" />
        <TextInput
          accessibilityLabel="One thing for today"
          value={title}
          onChangeText={onChangeTitle}
          onSubmitEditing={onSubmit}
          placeholder="Name one thing…"
          placeholderTextColor={colors['ink-subtle']}
          returnKeyType="done"
          submitBehavior="blurAndSubmit"
          style={ONE_LINE_FIELD}
          className="h-full min-w-0 flex-1 type-body text-ink"
        />
        {hasTitle && (
          <View className="size-9 items-center justify-center rounded-full bg-accent">
            <Icon name="check" size={18} strokeWidth={2.6} colorClassName="text-on-accent" />
          </View>
        )}
      </Animated.View>
      <Animated.Text
        entering={reduceMotion ? undefined : FadeIn.delay(140).duration(ENTER_MS)}
        className="mt-6.5 mb-3 type-label text-ink-subtle uppercase"
      >
        Ideas
      </Animated.Text>
      <View className="flex-row flex-wrap gap-2">
        {IDEAS.map((idea, index) => (
          <IdeaChip
            key={idea.title}
            idea={idea}
            index={index}
            selected={title === idea.title}
            onPress={() => onPickIdea(idea.title)}
          />
        ))}
      </View>
    </View>
  );
}
