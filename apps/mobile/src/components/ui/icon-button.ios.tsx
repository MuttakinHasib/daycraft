import { Button, Host } from '@expo/ui/swift-ui';
import { buttonBorderShape, controlSize, labelStyle, tint } from '@expo/ui/swift-ui/modifiers';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { useThemeColors } from '@/theme/app-theme';

import { DrawnIconButton } from './drawn-icon-button';
import { IconButtonSize, type IconButtonProps } from './icon-button-types';
import { nativeButtonStyle } from './native-glass';

type SFSymbol = NonNullable<ComponentProps<typeof Button>['systemImage']>;

// The SF Symbol for each icon the native button draws; any other icon keeps the drawn button.
const SF_SYMBOLS: Partial<Record<IconButtonProps['icon'], SFSymbol>> = {
  x: 'xmark',
  'chev-l': 'chevron.left',
  'chev-r': 'chevron.right',
  'chev-d': 'chevron.down',
  more: 'ellipsis',
  plus: 'plus',
  minus: 'minus',
};

const SIZE_PX = { sm: 32, lg: 44 } as const;

/** A round icon-only button: the native iOS glass button. */
export function IconButton(props: IconButtonProps) {
  const { icon, accessibilityLabel, onPress, size = IconButtonSize.SM } = props;
  const colors = useThemeColors();
  const symbol = SF_SYMBOLS[icon];
  if (!symbol) return <DrawnIconButton {...props} />;
  return (
    <View style={{ width: SIZE_PX[size], height: SIZE_PX[size] }} className="items-center justify-center">
      <Host matchContents>
        <Button
          label={accessibilityLabel}
          systemImage={symbol}
          onPress={onPress}
          modifiers={[
            labelStyle('iconOnly'),
            nativeButtonStyle(),
            buttonBorderShape('circle'),
            controlSize(size === IconButtonSize.LG ? 'large' : 'regular'),
            // Ink icons, as the drawn buttons had, instead of the system blue.
            tint(colors.ink),
          ]}
        />
      </Host>
    </View>
  );
}
