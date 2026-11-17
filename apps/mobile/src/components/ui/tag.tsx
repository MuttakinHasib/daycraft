import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface TagProps {
  children: ReactNode;
}

export function Tag({ children }: TagProps) {
  return (
    <View className="tag">
      <Text className="text-xs font-sans-bold text-ink-muted">{children}</Text>
    </View>
  );
}
