import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useTopInset } from '@/lib/use-top-inset';

// Space between the tucked top inset and the title.
const TITLE_GAP = 8;

interface TabScreenProps {
  title: string;
  description: string;
  children?: ReactNode;
}

/** A tab root: the display title, one line under it, and bottom padding so the last content can scroll above the tab bar. */
export function TabScreen({ title, description, children }: TabScreenProps) {
  const topInset = useTopInset();
  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerStyle={{ paddingTop: topInset + TITLE_GAP }}
      contentContainerClassName="gap-6 px-5 pb-30"
    >
      <View className="gap-2">
        <Text accessibilityRole="header" className="type-display text-ink">
          {title}
        </Text>
        <Text className="type-body text-ink-muted">{description}</Text>
      </View>
      {children}
    </ScrollView>
  );
}
