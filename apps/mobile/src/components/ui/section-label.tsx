import { Text } from 'react-native';

interface SectionLabelProps {
  children: string;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return <Text className="type-label uppercase text-ink-subtle">{children}</Text>;
}
