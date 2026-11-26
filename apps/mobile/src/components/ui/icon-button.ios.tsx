import { Button, Host, Image } from '@expo/ui/swift-ui';
import { buttonBorderShape, controlSize, frame, glassEffect, labelStyle, tint } from '@expo/ui/swift-ui/modifiers';
import { Pressable, View } from 'react-native';

import { useColorScheme, useThemeColors } from '@/theme/app-theme';

import { DrawnIconButton } from './drawn-icon-button';
import { IconButtonSize, type IconButtonProps } from './icon-button-types';
import { GLASS_AVAILABLE, nativeButtonStyle } from './native-glass';
import { SF_SYMBOLS } from './sf-symbols';

const SIZE_PX = { sm: 32, lg: 44 } as const;
const SYMBOL_PX = { sm: 15, lg: 18 } as const;

/**
 * A round icon-only button: a Liquid Glass circle of a fixed size. The system glass button sizes itself to its
 * symbol, so a flat one (minus) came out smaller than its neighbour; the glass here only draws, and a React Native
 * tap target sits on top because native taps inside a form sheet can fall through.
 */
export function IconButton(props: IconButtonProps) {
  const { icon, accessibilityLabel, onPress, size = IconButtonSize.SM } = props;
  const colors = useThemeColors();
  const scheme = useColorScheme();
  const symbol = SF_SYMBOLS[icon];
  if (!symbol) return <DrawnIconButton {...props} />;
  const px = SIZE_PX[size];
  if (!GLASS_AVAILABLE) {
    return (
      <View style={{ width: px, height: px }} className="items-center justify-center">
        <Host matchContents colorScheme={scheme}>
          <Button
            label={accessibilityLabel}
            systemImage={symbol}
            onPress={onPress}
            modifiers={[
              labelStyle('iconOnly'),
              nativeButtonStyle(),
              buttonBorderShape('circle'),
              controlSize(size === IconButtonSize.LG ? 'large' : 'regular'),
              tint(colors.ink),
            ]}
          />
        </Host>
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={size === IconButtonSize.SM ? 6 : 0}
      onPress={onPress}
      style={{ width: px, height: px }}
      className="rounded-full active:opacity-70"
    >
      {/* The glass only draws; the tap target carries the accessibility, so the drawn symbol hides. */}
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Host matchContents colorScheme={scheme}>
          <Image
            systemName={symbol}
            size={SYMBOL_PX[size]}
            color={colors.ink}
            modifiers={[
              frame({ width: px, height: px }),
              glassEffect({ glass: { variant: 'regular' }, shape: 'circle' }),
            ]}
          />
        </Host>
      </View>
    </Pressable>
  );
}
