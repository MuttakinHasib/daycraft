import { ScrollView, Text, View } from 'react-native';

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
  return (
    <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-8 px-5 pt-safe-offset-4 pb-30">
      <View className="gap-1">
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
