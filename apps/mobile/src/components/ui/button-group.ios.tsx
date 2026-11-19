import { GlassEffectContainer, Host, HStack, Image, Text } from '@expo/ui/swift-ui';
import { Pressable, View } from 'react-native';
import { font, foregroundStyle, frame, glassEffect } from '@expo/ui/swift-ui/modifiers';

import { useThemeColors } from '@/theme/app-theme';

import type { ButtonGroupProps, GroupButton } from './button-group-types';
import { GLASS_AVAILABLE } from './native-glass';
import { SF_SYMBOLS } from './sf-symbols';
import { ButtonGroup as DrawnButtonGroup } from './button-group';

const SIZE = 44;
const TEXT_WIDTH = 84;
// Shapes this close flow into one piece of glass, as in the system's own toolbars.
const GAP = 2;
const MERGE_DISTANCE = 16;
const GLASS = { glass: { variant: 'regular' as const, interactive: false } };

const widthOf = (button: GroupButton) => ('icon' in button ? SIZE : TEXT_WIDTH);

/**
 * Buttons side by side in a sheet header (Today ×, ‹ › ×), drawn as one connected piece of Liquid Glass.
 * The glass only draws; React Native tap targets of the same size sit on top, because native taps inside a
 * form sheet's own gesture area can fall through to the content below.
 */
export function ButtonGroup(props: ButtonGroupProps) {
  const colors = useThemeColors();
  if (!GLASS_AVAILABLE) return <DrawnButtonGroup {...props} />;
  const { buttons } = props;
  return (
    <View>
      <View pointerEvents="none">
        <Host matchContents>
          <GlassEffectContainer spacing={MERGE_DISTANCE}>
            <HStack spacing={GAP}>
              {buttons.map((button) =>
                'icon' in button ? (
                  <Image
                    key={button.accessibilityLabel}
                    systemName={SF_SYMBOLS[button.icon] ?? 'circle'}
                    size={18}
                    color={colors.ink}
                    modifiers={[frame({ width: SIZE, height: SIZE }), glassEffect({ ...GLASS, shape: 'circle' })]}
                  />
                ) : (
                  <Text
                    key={button.label}
                    modifiers={[
                      font({ family: 'Onest-SemiBold', size: 17 }),
                      foregroundStyle(colors.ink),
                      frame({ width: TEXT_WIDTH, height: SIZE }),
                      glassEffect({ ...GLASS, shape: 'capsule' }),
                    ]}
                  >
                    {button.label}
                  </Text>
                ),
              )}
            </HStack>
          </GlassEffectContainer>
        </Host>
      </View>
      <View style={{ gap: GAP }} className="absolute inset-0 flex-row">
        {buttons.map((button) => (
          <Pressable
            key={'icon' in button ? button.accessibilityLabel : button.label}
            accessibilityRole="button"
            accessibilityLabel={'icon' in button ? button.accessibilityLabel : button.label}
            onPress={button.onPress}
            style={{ width: widthOf(button), height: SIZE }}
            className="rounded-full active:bg-ink/8"
          />
        ))}
      </View>
    </View>
  );
}
