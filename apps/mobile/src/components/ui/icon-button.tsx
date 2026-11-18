import type { IconName } from '@daycraft/domain';
import { Pressable } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon } from './icon';

export const IconButtonSize = {
  /** 32: dense rows, such as the editor's day arrows. */
  SM: 'sm',
  /** 44: steppers. */
  LG: 'lg',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type IconButtonSize = (typeof IconButtonSize)[keyof typeof IconButtonSize];

interface IconButtonProps {
  icon: IconName;
  /** Required: the button has no visible text. */
  accessibilityLabel: string;
  onPress: () => void;
  size?: IconButtonSize;
  /** `surface` instead of `sunken`, for a button that sits on a sunken track. */
  onSunken?: boolean;
}

/** A round icon-only button with an `ink` icon. */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  size = IconButtonSize.SM,
  onSunken = false,
}: IconButtonProps) {
  const small = size === IconButtonSize.SM;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={small ? 6 : 0}
      className={cn('items-center justify-center rounded-full active:opacity-70', {
        'size-8': small,
        'size-11': !small,
        'bg-sunken': !onSunken,
        'bg-surface': onSunken,
      })}
    >
      <Icon name={icon} size={small ? 16 : 18} colorClassName="text-ink" />
    </Pressable>
  );
}
