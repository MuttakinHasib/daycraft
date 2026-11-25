import { Button, Host } from '@expo/ui/swift-ui';
import { buttonBorderShape, controlSize, font, tint } from '@expo/ui/swift-ui/modifiers';

import { useColorScheme, useThemeColors } from '@/theme/app-theme';

import { nativeButtonStyle } from './native-glass';
import type { TextButtonProps } from './text-button-types';

/** A small text button, such as Today: the native iOS glass capsule, in Onest. */
export function TextButton({ label, onPress }: TextButtonProps) {
  const colors = useThemeColors();
  const scheme = useColorScheme();
  return (
    <Host colorScheme={scheme} matchContents>
      <Button
        label={label}
        onPress={onPress}
        modifiers={[
          nativeButtonStyle(),
          buttonBorderShape('capsule'),
          controlSize('regular'),
          font({ family: 'Onest-SemiBold', size: 15 }),
          tint(colors.ink),
        ]}
      />
    </Host>
  );
}
