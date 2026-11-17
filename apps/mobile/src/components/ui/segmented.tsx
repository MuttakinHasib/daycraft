import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

interface SegmentedProps {
  children: ReactNode;
}

export function Segmented({ children }: SegmentedProps) {
  return <View className="segmented">{children}</View>;
}

interface SegmentedButtonProps {
  selected?: boolean;
  onPress?: () => void;
  children: ReactNode;
}

export function SegmentedButton({ selected = false, onPress, children }: SegmentedButtonProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      data-pressed={selected}
      onPress={onPress}
      className="flex h-8 flex-1 items-center justify-center rounded-[10px] data-[pressed=true]:bg-elevated"
    >
      <Text
        data-pressed={selected}
        className="text-[13px] font-sans-semibold text-ink-muted data-[pressed=true]:text-ink"
      >
        {children}
      </Text>
    </Pressable>
  );
}
