import { Pressable } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon } from './icon';
import { IconButtonSize, type IconButtonProps } from './icon-button-types';

/** A round icon-only button drawn in React Native, with an `ink` icon. */
export function DrawnIconButton({
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
