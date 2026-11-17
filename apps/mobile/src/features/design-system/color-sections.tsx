import { checkContrast, hueColors, SemanticColor } from '@daycraft/design-tokens';
import { ActivityHue } from '@daycraft/domain';
import { Text, View } from 'react-native';

import { ActivityHueBackground, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useColorScheme, useThemeColors } from '@/theme/app-theme';

import { Section } from './section';
import { SemanticColorBackground } from './token-classes';

export function SemanticColorSection() {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  return (
    <Section title="Semantic colors" description={`Values for the ${scheme} theme. They flip with the theme.`}>
      <View className="overflow-hidden rounded-card border border-line bg-surface">
        {Object.values(SemanticColor).map((name, index) => (
          <View
            key={name}
            className={cn('flex-row items-center gap-3 px-4 py-2.5', { 'border-t border-line': index > 0 })}
          >
            <View className={cn('size-8 rounded-tile border border-line', SemanticColorBackground[name])} />
            <Text className="type-body flex-1 text-ink">{name}</Text>
            <Text className="type-meta text-ink-subtle">{colors[name]}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

export function HueSection() {
  return (
    <Section title="Activity hues" description="The same in both themes. They color user content only.">
      <View className="flex-row flex-wrap gap-3">
        {Object.values(ActivityHue).map((hue) => (
          <View key={hue} className="w-24 gap-1.5">
            <View className={cn('h-14 items-center justify-center rounded-tile', ActivityHueBackground[hue])}>
              <Icon name="check" size={22} colorClassName="text-white" />
            </View>
            <Text className="type-control text-ink">{hue}</Text>
            <Text className="type-meta text-ink-subtle">{hueColors[hue]}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

export function ContrastSection() {
  const results = checkContrast();
  return (
    <Section title="Contrast" description="Checked in the token build; a failing pair fails the build.">
      <View className="overflow-hidden rounded-card border border-line bg-surface">
        {results.map((result, index) => (
          <View
            key={result.pair}
            className={cn('flex-row items-center gap-3 px-4 py-2.5', { 'border-t border-line': index > 0 })}
          >
            <Text className="type-body-sm flex-1 text-ink">{result.pair}</Text>
            <Text className={cn('type-meta', { 'text-success': result.passes, 'text-danger': !result.passes })}>
              {`${result.ratio.toFixed(1)} : 1 (≥ ${result.minimum})`}
            </Text>
          </View>
        ))}
      </View>
    </Section>
  );
}
