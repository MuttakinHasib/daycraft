import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { SectionLabel } from '@/components/ui';

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function Section({ title, description, children }: SectionProps) {
  return (
    <View className="gap-3">
      <View className="gap-1">
        <SectionLabel>{title}</SectionLabel>
        {description && <Text className="type-body-sm text-ink-muted">{description}</Text>}
      </View>
      {children}
    </View>
  );
}
