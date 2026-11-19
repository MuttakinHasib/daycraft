import { Button, Divider, Host, Image, Menu } from '@expo/ui/swift-ui';
import { View } from 'react-native';

import { useColorScheme, useThemeColors } from '@/theme/app-theme';

import type { MoreMenuProps } from './more-menu-types';

/** The band's ⋯: the native iOS menu with Duplicate and Delete. */
export function MoreMenu({ onDuplicate, onDelete }: MoreMenuProps) {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  // Matches the band's text: ink on the light tint, on-hue on the solid dark band.
  const color = scheme === 'dark' ? colors['on-hue'] : colors.ink;
  return (
    <View className="size-10 items-center justify-center rounded-full bg-ink/8">
      <Host matchContents>
        <Menu label={<Image systemName="ellipsis" size={18} color={color} />}>
          <Button label="Duplicate" systemImage="plus.square.on.square" onPress={onDuplicate} />
          <Divider />
          <Button label="Delete" systemImage="trash" role="destructive" onPress={onDelete} />
        </Menu>
      </Host>
    </View>
  );
}
