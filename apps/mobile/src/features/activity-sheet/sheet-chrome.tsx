import { hueColors, sheetHeaderTint, withOpacity } from '@daycraft/design-tokens';
import type { ActivityHue, IconName } from '@daycraft/domain';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useColorScheme } from '@/theme/app-theme';

// The parts the activity editor and detail sheets share: the hue band at the top and the footer.

/** Text and icons on the band. Light: ink on the 40% tint. Dark: on-hue on the solid hue. */
export const BAND_TEXT = 'text-ink dark:text-on-hue';

export const BandTileShape = {
  /** The editor: a 56 circle. */
  CIRCLE: 'circle',
  /** The detail sheet: a 56×72 capsule. */
  CAPSULE: 'capsule',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type BandTileShape = (typeof BandTileShape)[keyof typeof BandTileShape];

interface HueBandProps {
  hue: ActivityHue;
  children: ReactNode;
}

interface BandButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
}

interface BandTileProps {
  icon: IconName;
  shape: BandTileShape;
}

interface SheetFooterProps {
  /** Shows the danger Delete button first when given. */
  onDelete?: () => void;
  children: ReactNode;
}

/** The sheet's header band in the activity's hue. */
export function HueBand({ hue, children }: HueBandProps) {
  const scheme = useColorScheme();
  return (
    <View collapsable={false} className="bg-canvas">
      <View
        style={{ backgroundColor: withOpacity(hueColors[hue], sheetHeaderTint[scheme]) }}
        className="px-5 pt-4 pb-6"
      >
        {children}
      </View>
    </View>
  );
}

/** A 40 round button on the band, such as Close and Edit. */
export function BandButton({ icon, accessibilityLabel, onPress }: BandButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="size-10 items-center justify-center rounded-full bg-ink/8 active:opacity-70"
    >
      <Icon name={icon} size={18} colorClassName={BAND_TEXT} />
    </Pressable>
  );
}

/** The activity's icon on the band, ringed in on-hue. */
export function BandTile({ icon, shape }: BandTileProps) {
  return (
    <View
      className={cn('items-center justify-center border-2 border-on-hue/55 bg-ink/8', {
        'size-14 rounded-full': shape === BandTileShape.CIRCLE,
        'h-18 w-14 rounded-capsule': shape === BandTileShape.CAPSULE,
      })}
    >
      <Icon name={icon} size={25} colorClassName={BAND_TEXT} />
    </View>
  );
}

/** The sheet's footer: an optional Delete, then the main action. */
export function SheetFooter({ onDelete, children }: SheetFooterProps) {
  return (
    <View collapsable={false} className="flex-row gap-2.5 border-t border-line px-5 pt-3 pb-safe-offset-3">
      {onDelete && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete"
          onPress={onDelete}
          className="size-13 items-center justify-center rounded-full bg-sunken active:opacity-70"
        >
          <Icon name="trash" size={19} colorClassName="text-danger" />
        </Pressable>
      )}
      <View className="flex-1">{children}</View>
    </View>
  );
}
