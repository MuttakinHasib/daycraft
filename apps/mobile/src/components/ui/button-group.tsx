import { View } from 'react-native';

import type { ButtonGroupProps } from './button-group-types';
import { IconButton } from './icon-button';
import { IconButtonSize } from './icon-button-types';
import { TextButton } from './text-button';

/** Buttons side by side in a sheet header (Today ×, ‹ › ×). iOS joins them into one piece of glass. */
export function ButtonGroup({ buttons }: ButtonGroupProps) {
  return (
    <View className="flex-row items-center gap-2">
      {buttons.map((button) =>
        'icon' in button ? (
          <IconButton
            key={button.accessibilityLabel}
            icon={button.icon}
            size={IconButtonSize.LG}
            accessibilityLabel={button.accessibilityLabel}
            onPress={button.onPress}
          />
        ) : (
          <TextButton key={button.label} label={button.label} onPress={button.onPress} />
        ),
      )}
    </View>
  );
}
