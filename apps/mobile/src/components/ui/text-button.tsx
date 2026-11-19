import { Chip, ChipSize } from './chip';
import type { TextButtonProps } from './text-button-types';

/** A small text button, such as Today. iOS and Android draw native ones (`text-button.ios.tsx`, `.android.tsx`). */
export function TextButton({ label, onPress }: TextButtonProps) {
  return (
    <Chip size={ChipSize.SM} onPress={onPress}>
      {label}
    </Chip>
  );
}
