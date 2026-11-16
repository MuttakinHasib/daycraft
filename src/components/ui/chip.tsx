import type { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';

interface ChipProps {
  pressed?: boolean;
  onPress?: () => void;
  children: ReactNode;
}

export function Chip({ pressed = false, onPress, children }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: pressed }}
      data-pressed={pressed}
      onPress={onPress}
      className="chip data-[pressed=true]:bg-ink"
    >
      <Text
        data-pressed={pressed}
        className="text-[13px] font-sans-bold text-ink-muted data-[pressed=true]:text-canvas"
      >
        {children}
      </Text>
    </Pressable>
  );
}
