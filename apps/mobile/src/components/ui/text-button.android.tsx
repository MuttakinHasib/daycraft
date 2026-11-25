import { FilledTonalButton, Host, Text } from '@expo/ui/jetpack-compose';

import { useColorScheme, useThemeColors } from '@/theme/app-theme';

import type { TextButtonProps } from './text-button-types';

/** A small text button, such as Today: Material 3's filled tonal button. */
export function TextButton({ label, onPress }: TextButtonProps) {
  const colors = useThemeColors();
  const scheme = useColorScheme();
  return (
    <Host colorScheme={scheme} matchContents>
      <FilledTonalButton onClick={onPress} colors={{ containerColor: colors.sunken, contentColor: colors.ink }}>
        <Text style={{ fontFamily: 'Onest-SemiBold', fontSize: 15 }}>{label}</Text>
      </FilledTonalButton>
    </Host>
  );
}
