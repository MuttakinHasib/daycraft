import type { IconName } from '@daycraft/domain';
import { Pressable, Text } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon } from './icon';

export const ChipSize = {
  /** 36 tall. */
  MD: 'md',
  /** 32 tall: dense rows such as Plan and Place on list items. */
  SM: 'sm',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type ChipSize = (typeof ChipSize)[keyof typeof ChipSize];

interface ChipProps {
  selected?: boolean;
  size?: ChipSize;
  icon?: IconName;
  onPress?: () => void;
  children: string;
}

// Extra touch area so each size reaches the 44pt minimum (36 and 32 tall).
const CHIP_HIT_SLOP: Record<ChipSize, number> = { md: 4, sm: 6 };

export function Chip({ selected = false, size = ChipSize.MD, icon, onPress, children }: ChipProps) {
  const textColor = cn({ 'text-ink-muted': !selected, 'text-canvas': selected });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={CHIP_HIT_SLOP[size]}
      onPress={onPress}
      className={cn('shrink-0 flex-row items-center self-start rounded-full', {
        'h-9 gap-1.5 px-4': size === ChipSize.MD,
        'h-8 gap-1 px-3': size === ChipSize.SM,
        'bg-sunken': !selected,
        'bg-ink': selected,
      })}
    >
      {icon && <Icon name={icon} size={16} colorClassName={textColor} />}
      <Text className={cn('type-control', textColor)}>{children}</Text>
    </Pressable>
  );
}
