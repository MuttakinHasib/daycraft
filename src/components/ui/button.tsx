import type { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onPress?: () => void;
  disabled?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'primary', onPress, disabled = false, children }: ButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={`${isPrimary ? 'btn-primary' : 'btn-secondary'} active:opacity-90 disabled:opacity-50`}
    >
      <Text className={`text-base font-sans-bold ${isPrimary ? 'text-on-accent' : 'text-ink'}`}>
        {children}
      </Text>
    </Pressable>
  );
}
