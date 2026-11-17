import { describeTypeStyle, fontFamilies, Radius, radii, TypePreset, typeScale } from '@daycraft/design-tokens';
import { Text, View } from 'react-native';

import { cn } from '@/lib/cn';

import { Section } from './section';
import { RadiusClass, TypePresetClass } from './token-classes';

const SAMPLE: Record<TypePreset, string> = {
  display: 'Plan',
  date: 'Tuesday 17',
  title: 'November 2026',
  heading: 'A blank canvas',
  activity: 'Deep work · Onboarding flow',
  body: 'Nothing planned for this day yet.',
  'body-sm': 'Tap any hour to drop something in.',
  control: 'Today',
  meta: '9:30–11:30 AM (2 hr)',
  label: 'SECTION LABEL',
  micro: '10:40',
  clock: '24:59',
};

export function TypeSection() {
  return (
    <Section title="Type" description="Plus Jakarta Sans. Each preset is a type-* class on mobile and web.">
      <View className="gap-4 rounded-card border border-line bg-surface p-4">
        {Object.values(TypePreset).map((preset) => (
          <View key={preset} className="gap-0.5">
            <Text className="type-meta text-ink-subtle">{`type-${preset} · ${describeTypeStyle(preset)} · ${typeScale[preset].use}`}</Text>
            <Text className={cn(TypePresetClass[preset], 'text-ink')} numberOfLines={1}>
              {SAMPLE[preset]}
            </Text>
          </View>
        ))}
      </View>
      <Text className="type-meta text-ink-subtle">
        {`Families: ${Object.values(fontFamilies).map((family) => `font-${family.className}`).join(', ')}`}
      </Text>
    </Section>
  );
}

export function RadiusSection() {
  return (
    <Section title="Radii" description="Pills always use rounded-full.">
      <View className="flex-row flex-wrap gap-3">
        {Object.values(Radius).map((name) => (
          <View key={name} className="w-24 gap-1.5">
            <View className={cn('h-16 border-2 border-line-strong bg-sunken', RadiusClass[name])} />
            <Text className="type-control text-ink">{name}</Text>
            <Text className="type-meta text-ink-subtle">{`${radii[name].px}px`}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

export function ElevationSection() {
  return (
    <Section title="Elevation" description="Flat by default. Shadows only on things that float.">
      <View className="flex-row gap-4">
        <View className="h-20 flex-1 items-center justify-center rounded-card bg-surface shadow-float">
          <Text className="type-control text-ink">shadow-float</Text>
        </View>
        <View className="h-20 flex-1 items-center justify-center rounded-card bg-surface shadow-lift">
          <Text className="type-control text-ink">shadow-lift</Text>
        </View>
      </View>
    </Section>
  );
}
