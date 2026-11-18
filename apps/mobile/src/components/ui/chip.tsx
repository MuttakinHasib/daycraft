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

/** The chip's colors when it is not a selected toggle. */
export const ChipTone = {
  /** `sunken` with `ink-muted` text. */
  NEUTRAL: 'neutral',
  /** `accent` with `on-accent` text: the one action in a place, such as **+ Plan this day**. */
  ACCENT: 'accent',
  /** `accent-soft` with `accent-text`, such as the Today chip. */
  ACCENT_SOFT: 'accentSoft',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type ChipTone = (typeof ChipTone)[keyof typeof ChipTone];

interface ChipProps {
  selected?: boolean;
  size?: ChipSize;
  tone?: ChipTone;
  icon?: IconName;
  onPress?: () => void;
  accessibilityLabel?: string;
  children: string;
}

// Extra touch area so each size reaches the 44pt minimum (36 and 32 tall).
const CHIP_HIT_SLOP: Record<ChipSize, number> = { md: 4, sm: 6 };

export function Chip({
  selected = false,
  size = ChipSize.MD,
  tone = ChipTone.NEUTRAL,
  icon,
  onPress,
  accessibilityLabel,
  children,
}: ChipProps) {
  const neutral = !selected && tone === ChipTone.NEUTRAL;
  const accent = !selected && tone === ChipTone.ACCENT;
  const accentSoft = !selected && tone === ChipTone.ACCENT_SOFT;
  const textColor = cn({
    'text-ink-muted': neutral,
    'text-canvas': selected,
    'text-on-accent': accent,
    'text-accent-text': accentSoft,
  });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={CHIP_HIT_SLOP[size]}
      onPress={onPress}
      className={cn('shrink-0 flex-row items-center self-start rounded-full active:opacity-85', {
        'h-9 gap-1.5 px-4': size === ChipSize.MD,
        'h-8 gap-1 px-3': size === ChipSize.SM,
        'bg-sunken': neutral,
        'bg-ink': selected,
        'bg-accent': accent,
        'bg-accent-soft': accentSoft,
      })}
    >
      {icon && <Icon name={icon} size={size === ChipSize.SM ? 14 : 16} colorClassName={textColor} />}
      <Text className={cn('type-control', textColor)}>{children}</Text>
    </Pressable>
  );
}
