import { FilledTonalIconButton, Host, RNHostView } from '@expo/ui/jetpack-compose';
import { semantics, size as sizeModifier } from '@expo/ui/jetpack-compose/modifiers';

import { useColorScheme, useThemeColors } from '@/theme/app-theme';

import { Icon } from './icon';
import { IconButtonSize, type IconButtonProps } from './icon-button-types';

const SIZE_DP = { sm: 32, lg: 44 } as const;

/** A round icon-only button: Material 3's filled tonal icon button, with the app's own icon inside. */
export function IconButton({ icon, accessibilityLabel, onPress, size = IconButtonSize.SM }: IconButtonProps) {
  const colors = useThemeColors();
  const scheme = useColorScheme();
  const px = SIZE_DP[size];
  return (
    <Host colorScheme={scheme} matchContents>
      <FilledTonalIconButton
        onClick={onPress}
        colors={{ containerColor: colors.sunken, contentColor: colors.ink }}
        modifiers={[sizeModifier(px, px), semantics({ contentDescription: accessibilityLabel })]}
      >
        <RNHostView matchContents>
          <Icon name={icon} size={size === IconButtonSize.LG ? 18 : 16} colorClassName="text-ink" />
        </RNHostView>
      </FilledTonalIconButton>
    </Host>
  );
}
