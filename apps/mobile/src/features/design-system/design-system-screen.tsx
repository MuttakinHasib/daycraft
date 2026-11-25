import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Icon } from '@/components/ui';
import { useTopInset } from '@/lib/use-top-inset';

import { ContrastSection, HueSection, HueTintSection, SemanticColorSection } from './color-sections';
import {
  AppearanceSection,
  ButtonSection,
  CapsuleSection,
  CheckRingSection,
  ChipSection,
  SegmentedSection,
} from './component-sections';
import { IconSection } from './icon-section';
import { ElevationSection, RadiusSection, TypeSection } from './type-shape-sections';

export function DesignSystemScreen() {
  const router = useRouter();
  const topInset = useTopInset();
  // Pops back to the More list (or replaces this screen with it after a deep link). Plain `back()`
  // could follow the tab history to another tab instead.
  const goBack = () => router.dismissTo('/more');
  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerStyle={{ paddingTop: topInset }}
      contentContainerClassName="gap-8 px-5 pb-30"
    >
      <View className="gap-1">
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Back to More"
          onPress={goBack}
          hitSlop={8}
          className="-ml-1 min-h-11 flex-row items-center gap-0.5 self-start active:opacity-70"
        >
          <Icon name="chev-l" size={18} colorClassName="text-accent-text" />
          <Text className="type-control text-accent-text">More</Text>
        </Pressable>
        <Text className="type-display text-ink">Design system</Text>
        <Text className="type-body-sm text-ink-muted">Daycraft v2 (Clean), rendered from @daycraft/design-tokens.</Text>
      </View>
      <AppearanceSection />
      <SemanticColorSection />
      <HueSection />
      <HueTintSection />
      <ContrastSection />
      <TypeSection />
      <RadiusSection />
      <ElevationSection />
      <IconSection />
      <ButtonSection />
      <ChipSection />
      <SegmentedSection />
      <CheckRingSection />
      <CapsuleSection />
    </ScrollView>
  );
}
