import type { ReactNode } from 'react';
import { Pressable } from 'react-native';

interface CheckRingProps {
  checked?: boolean;
  onPress?: () => void;
  children?: ReactNode;
}

export function CheckRing({ checked = false, onPress, children }: CheckRingProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      data-checked={checked}
      hitSlop={9}
      onPress={onPress}
      className="relative flex size-[26px] items-center justify-center rounded-full border-2 border-ink-subtle data-[checked=true]:border-success"
    >
      {children}
    </Pressable>
  );
}
