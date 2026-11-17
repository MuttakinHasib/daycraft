import type { ReactNode } from 'react';
import { Text } from 'react-native';

interface SectionLabelProps {
  children: ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return <Text className="section-label">{children}</Text>;
}
