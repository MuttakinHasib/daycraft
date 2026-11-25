import { Host, HStack, Picker, Text } from '@expo/ui/swift-ui';
import { font, foregroundStyle, frame, labelsHidden, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';

import { View } from 'react-native';

import { useColorScheme, useThemeColors } from '@/theme/app-theme';

import { WHEEL_HEIGHT, type WheelProps } from './wheel-types';

/** Native iOS picker wheels side by side, one per column, in Onest. */
export function Wheel({ columns, accessibilityLabel }: WheelProps) {
  const colors = useThemeColors();
  const scheme = useColorScheme();
  return (
    <View accessibilityLabel={accessibilityLabel}>
      <Host colorScheme={scheme} style={{ height: WHEEL_HEIGHT }}>
        <HStack spacing={0}>
          {columns.map((column) => (
            <Picker
              key={column.key}
              selection={column.value}
              onSelectionChange={(value) => column.onChange(Number(value))}
              modifiers={[pickerStyle('wheel'), labelsHidden(), frame({ maxWidth: 400 })]}
            >
              {column.options.map((option) => (
                <Text
                  key={option.value}
                  modifiers={[
                    tag(option.value),
                    font({ family: 'Onest-Medium', size: 21 }),
                    foregroundStyle(colors.ink),
                  ]}
                >
                  {option.label}
                </Text>
              ))}
            </Picker>
          ))}
        </HStack>
      </Host>
    </View>
  );
}
