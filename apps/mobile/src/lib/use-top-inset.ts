import { useSafeAreaInsets } from 'react-native-safe-area-context';

// The top safe area ends 8pt below the status bar's content; screens without a navigation bar tuck into that space.
const STATUS_BAR_TUCK = 8;

/** Where a screen's own content starts: the top safe area less the status bar's spare space. */
export function useTopInset(): number {
  return Math.max(0, useSafeAreaInsets().top - STATUS_BAR_TUCK);
}
