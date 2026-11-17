import type { IconName } from '@daycraft/domain';
import { Pressable, Text } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon } from './icon';

export const ButtonVariant = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];

export const ButtonSize = {
  /** 52 tall: the main action of a sheet or screen. */
  LG: 'lg',
  /** 44 tall: secondary actions and steppers. */
  MD: 'md',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type ButtonSize = (typeof ButtonSize)[keyof typeof ButtonSize];

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  disabled?: boolean;
  onPress?: () => void;
  children: string;
}

export function Button({
  variant = ButtonVariant.PRIMARY,
  size = ButtonSize.LG,
  icon,
  disabled = false,
  onPress,
  children,
}: ButtonProps) {
  const isPrimary = variant === ButtonVariant.PRIMARY;
  const textColor = cn({ 'text-on-accent': isPrimary, 'text-ink': !isPrimary });
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'w-full flex-row items-center justify-center gap-2 rounded-full active:opacity-90 disabled:opacity-50',
        {
          'h-13': size === ButtonSize.LG,
          'h-11': size === ButtonSize.MD,
          'bg-accent': isPrimary,
          'bg-sunken': !isPrimary,
        },
      )}
    >
      {icon && <Icon name={icon} size={18} colorClassName={textColor} />}
      <Text className={cn('type-body font-sans-semibold', textColor)}>{children}</Text>
    </Pressable>
  );
}
