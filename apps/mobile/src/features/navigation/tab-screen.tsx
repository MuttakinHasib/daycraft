import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

interface TabScreenProps {
  title: string;
  description: string;
  children?: ReactNode;
}

/** A tab root: the display title, one line under it, and bottom padding so the last content can scroll above the tab bar. */
export function TabScreen({ title, description, children }: TabScreenProps) {
  return (
    <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-6 px-5 pt-safe-offset-6 pb-30">
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
