import { sheetHeaderTint, withOpacity } from '@daycraft/design-tokens';
import type { ActivityColor, IconName } from '@daycraft/domain';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { colorValue, Icon } from '@/components/ui';
import { useColorScheme } from '@/theme/app-theme';

// The activity sheet's hue band and the pieces on it.

interface HueBandProps {
  hue: ActivityColor;
  children: ReactNode;
}

interface BandTileProps {
  icon: IconName;
  /** The band's text class (`bandTextOn`), so the icon reads on light custom colours too. */
  textClass: string;
  /** Opens the colour and icon sheet. */
  onPress: () => void;
}

/** The sheet's header band in the activity's hue. */
export function HueBand({ hue, children }: HueBandProps) {
  const scheme = useColorScheme();
  return (
    <View collapsable={false} className="bg-canvas">
      <View
        style={{ backgroundColor: withOpacity(colorValue(hue), sheetHeaderTint[scheme]) }}
        className="px-5 pt-4 pb-6"
      >
        {children}
      </View>
    </View>
  );
}

/** The activity's icon on the band, a 56×72 capsule ringed in on-hue; tapping it changes colour and icon. */
export function BandTile({ icon, textClass, onPress }: BandTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Colour and icon"
      onPress={onPress}
      className="h-18 w-14 items-center justify-center rounded-capsule border-2 border-on-hue/55 bg-ink/8 active:opacity-70"
    >
      <Icon name={icon} size={25} colorClassName={textClass} />
    </Pressable>
  );
}
