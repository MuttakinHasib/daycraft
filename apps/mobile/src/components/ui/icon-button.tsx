import { DrawnIconButton } from './drawn-icon-button';
import type { IconButtonProps } from './icon-button-types';

/** A round icon-only button. iOS and Android draw native ones (`icon-button.ios.tsx`, `.android.tsx`). */
export function IconButton(props: IconButtonProps) {
  return <DrawnIconButton {...props} />;
}
