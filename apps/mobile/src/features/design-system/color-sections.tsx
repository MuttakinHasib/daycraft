import {
  CAPSULE_GRIP_OPACITY,
  checkContrast,
  hueColors,
  hueTints,
  SemanticColor,
  sheetHeaderTint,
  withOpacity,
} from '@daycraft/design-tokens';
import type { ReactNode } from 'react';
import { ActivityHue } from '@daycraft/domain';
import { Text, View } from 'react-native';

import { ActivityHueBackground, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useColorScheme, useThemeColors } from '@/theme/app-theme';

import { Section } from './section';
import { SemanticColorBackground } from './token-classes';

interface TintRowProps {
  name: string;
  share: string;
  first?: boolean;
  children: ReactNode;
}

const TINT_SAMPLE = hueColors.clay;

export function SemanticColorSection() {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  return (
    <Section title="Semantic colors" description={`Values for the ${scheme} theme. They flip with the theme.`}>
      <View className="overflow-hidden rounded-card bg-card">
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
              <Icon name="check" size={22} colorClassName="text-on-hue" />
            </View>
            <Text className="type-control text-ink">{hue}</Text>
            <Text className="type-meta text-ink-subtle">{hueColors[hue]}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

function TintRow({ name, share, first = false, children }: TintRowProps) {
  return (
    <View className={cn('flex-row items-center gap-3 px-4 py-2.5', { 'border-t border-line': !first })}>
      <View className="size-12 items-center justify-center rounded-tile bg-surface">{children}</View>
      <Text className="type-body flex-1 text-ink">{name}</Text>
      <Text className="type-meta text-ink-subtle">{share}</Text>
    </View>
  );
}

// Swatches sit on `surface`, the base most tints mix into; computed hue tints are allowed inline.
export function HueTintSection() {
  const scheme = useColorScheme();
  const header = sheetHeaderTint[scheme];
  return (
    <Section
      title="Hue tints"
      description="Shares of a hue from hueTints, shown on clay. Code reads the token, never a literal."
    >
      <View className="overflow-hidden rounded-card bg-card">
        <TintRow name="Habit circle, not done" share="14% · 60% dashed" first>
          <View
            className="size-9 rounded-full border-2 border-dashed"
            style={{
              backgroundColor: withOpacity(TINT_SAMPLE, hueTints.habitCircle),
              borderColor: withOpacity(TINT_SAMPLE, hueTints.habitCircleBorder),
            }}
          />
        </TintRow>
        <TintRow name="Event agenda card" share="16% · 40% border">
          <View
            className="size-9 rounded-tile border"
            style={{
              backgroundColor: withOpacity(TINT_SAMPLE, hueTints.agendaFill),
              borderColor: withOpacity(TINT_SAMPLE, hueTints.agendaBorder),
            }}
          />
        </TintRow>
        <TintRow name="Agenda Event tag" share="26%">
          <Text
            className="type-meta rounded-full px-2 text-ink"
            style={{ backgroundColor: withOpacity(TINT_SAMPLE, hueTints.agendaTag) }}
          >
            Event
          </Text>
        </TintRow>
        <TintRow name="Desktop habit chip" share="16% done · 18% icon">
          <View
            className="h-7 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: withOpacity(TINT_SAMPLE, hueTints.habitChipDone) }}
          >
            <View
              className="size-5 rounded-full"
              style={{ backgroundColor: withOpacity(TINT_SAMPLE, hueTints.habitChipIcon) }}
            />
          </View>
        </TintRow>
        <TintRow name="Week-grid task block" share="70% border">
          <View
            className="h-9 w-7 rounded-check border-2 bg-surface"
            style={{ borderColor: withOpacity(TINT_SAMPLE, hueTints.weekTaskBorder) }}
          />
        </TintRow>
        <TintRow name="Milestone done tag" share="24%">
          <View
            className="size-7 items-center justify-center rounded-full"
            style={{ backgroundColor: withOpacity(TINT_SAMPLE, hueTints.milestoneDone) }}
          >
            <Icon name="check" size={14} colorClassName="text-ink" />
          </View>
        </TintRow>
        <TintRow name="Active capsule ring" share="28%">
          <View
            className="size-10 items-center justify-center rounded-full"
            style={{ backgroundColor: withOpacity(TINT_SAMPLE, hueTints.activeRing) }}
          >
            <View className="size-8 rounded-full bg-clay" />
          </View>
        </TintRow>
        <TintRow name="Event card tint" share="30%">
          <View
            className="size-9 rounded-tile"
            style={{ backgroundColor: withOpacity(TINT_SAMPLE, hueTints.eventCard) }}
          />
        </TintRow>
        <TintRow name="Active capsule base" share="42% over surface">
          <View
            className="h-10 w-6 overflow-hidden rounded-full"
            style={{ backgroundColor: withOpacity(TINT_SAMPLE, hueTints.activeCapsuleBase) }}
          >
            <View className="h-1/2 bg-clay" />
          </View>
        </TintRow>
        <TintRow name="Headline highlight" share="42%">
          <Text
            className="type-control rounded-tile px-1.5 text-ink"
            style={{ backgroundColor: withOpacity(TINT_SAMPLE, hueTints.highlight) }}
          >
            Aa
          </Text>
        </TintRow>
        <TintRow name={`Sheet header (${scheme})`} share={header === 1 ? 'solid' : `${header * 100}%`}>
          <View
            className="size-9 items-center justify-center rounded-tile"
            style={{ backgroundColor: withOpacity(TINT_SAMPLE, header) }}
          >
            <Text className={cn('type-control', { 'text-ink': header < 1, 'text-on-hue': header === 1 })}>Aa</Text>
          </View>
        </TintRow>
        <TintRow name="Capsule resize grip" share="on-hue 75%">
          <View className="size-9 items-center justify-end rounded-tile bg-clay pb-1.5">
            <View className="h-0.75 w-4 rounded-full bg-on-hue" style={{ opacity: CAPSULE_GRIP_OPACITY }} />
          </View>
        </TintRow>
      </View>
    </Section>
  );
}

export function ContrastSection() {
  const results = checkContrast();
  return (
    <Section title="Contrast" description="Checked in the token build; a failing pair fails the build.">
      <View className="overflow-hidden rounded-card bg-card">
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
