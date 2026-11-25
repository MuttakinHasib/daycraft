import { Button, Divider, Host, Image, Menu } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  buttonStyle,
  frame,
  glassEffect,
  menuIndicator,
  menuStyle,
} from '@expo/ui/swift-ui/modifiers';

import { GLASS_AVAILABLE, nativeButtonStyle } from '@/components/ui/native-glass';
import { useColorScheme, useThemeColors } from '@/theme/app-theme';

import type { MoreMenuProps } from './more-menu-types';

const TRIGGER_SIZE = 44;

/** The band's ⋯: a native iOS glass button that opens the menu with Duplicate and Delete. */
export function MoreMenu({ onDuplicate, onDelete }: MoreMenuProps) {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  // Matches the band's text: ink on the light tint, on-hue on the solid dark band.
  const color = scheme === 'dark' ? colors['on-hue'] : colors.ink;
  return (
    <Host matchContents colorScheme={scheme}>
      <Menu
        label={
          // The trigger is drawn as a 44pt glass circle so it matches the × beside it; a menu's own
          // glass label comes out a size smaller.
          <Image
            systemName="ellipsis"
            size={18}
            color={color}
            modifiers={[
              frame({ width: TRIGGER_SIZE, height: TRIGGER_SIZE }),
              GLASS_AVAILABLE
                ? glassEffect({ glass: { variant: 'regular', interactive: true }, shape: 'circle' })
                : nativeButtonStyle(),
            ]}
          />
        }
        modifiers={[menuStyle('button'), buttonStyle('plain'), menuIndicator('hidden'), accessibilityLabel('More')]}
      >
        <Button label="Duplicate" systemImage="plus.square.on.square" onPress={onDuplicate} />
        <Divider />
        <Button label="Delete" systemImage="trash" role="destructive" onPress={onDelete} />
      </Menu>
    </Host>
  );
}
