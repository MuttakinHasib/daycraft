import { hueColors, hueTints, withOpacity } from '@daycraft/design-tokens';
import type { ActivityHue } from '@daycraft/domain';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export interface HeadlineCopy {
  before: string;
  /** The highlighted words: a soft marker in the step's hue (onboarding doc). */
  highlight: string;
  after: string;
  hue: ActivityHue;
  sub?: string;
}

interface HeadlineProps extends HeadlineCopy {
  /** "Step 1 of 3" on setup steps. */
  step: string | null;
}

const HEAD_FADE_MS = 280;

// The display line box (1.1) leaves only 3pt above the ascenders but room for descenders below. The marker reaches
// 3pt above the box so the space around the word reads even, like the 6pt at its sides.
const MARKER_INSET = { top: -3, bottom: 0 };

const wordsOf = (text: string) => text.split(/\s+/).filter(Boolean);

/** Step counter, headline with its highlight, and the line under it. Screen readers hear the plain sentence. */
export function Headline({ step, before, highlight, after, hue, sub }: HeadlineProps) {
  // A nested Text's background can't be padded or rounded evenly, so each word is its own Text and the marker is a
  // View; the row wraps between words like a sentence.
  const attached = after.match(/^\S*/)?.[0] ?? '';
  const beforeWords = wordsOf(before);
  const afterWords = wordsOf(after.slice(attached.length));
  const word = (text: string, index: number) => (
    <Text key={index} className="type-display text-ink">
      {`${text} `}
    </Text>
  );

  return (
    <Animated.View key={before + highlight} entering={FadeIn.duration(HEAD_FADE_MS)} className="gap-2 px-5">
      {step && <Text className="type-label text-ink-subtle uppercase">{step}</Text>}
      <View
        accessible
        accessibilityRole="header"
        accessibilityLabel={before + highlight + after}
        className="flex-row flex-wrap items-center"
      >
        {beforeWords.map(word)}
        <View className="flex-row items-center">
          <View className="px-1.5">
            <View
              style={{ ...MARKER_INSET, backgroundColor: withOpacity(hueColors[hue], hueTints.highlight) }}
              className="absolute inset-x-0 rounded-tile"
            />
            <Text className="type-display text-ink">{highlight}</Text>
          </View>
          <Text className="type-display text-ink">{`${attached}${afterWords.length ? ' ' : ''}`}</Text>
        </View>
        {afterWords.map(word)}
      </View>
      {sub ? <Text className="type-body-sm font-sans-medium text-ink-muted">{sub}</Text> : <View />}
    </Animated.View>
  );
}
