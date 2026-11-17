import type { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';

import { cn } from '@/lib/cn';

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
      className={cn('active:opacity-90 disabled:opacity-50', {
        'btn-primary': isPrimary,
        'btn-secondary': !isPrimary,
      })}
    >
      <Text
        className={cn('text-base font-sans-bold', {
          'text-on-accent': isPrimary,
          'text-ink': !isPrimary,
        })}
      >
        {children}
      </Text>
    </Pressable>
  );
}
