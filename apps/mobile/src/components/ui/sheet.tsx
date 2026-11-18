import { durations, easing } from '@daycraft/design-tokens';
import type { ReactNode } from 'react';
import Animated, {
  Easing,
  useReducedMotion,
  withTiming,
  type EntryExitAnimationFunction,
} from 'react-native-reanimated';

const snap = Easing.bezier(...easing.snap);

const sheetUp: EntryExitAnimationFunction = () => {
  'worklet';
  return {
    initialValues: {
      opacity: 0,
      transform: [{ translateY: 48 }],
    },
    animations: {
      opacity: withTiming(1, { duration: durations.fadeIn }),
      transform: [{ translateY: withTiming(0, { duration: durations.sheetUp, easing: snap }) }],
    },
  };
};

interface SheetProps {
  children: ReactNode;
}

export function Sheet({ children }: SheetProps) {
  // Reduce Motion: the sheet appears in place instead of sliding up.
  const reduceMotion = useReducedMotion();
  return (
    <Animated.View
      entering={reduceMotion ? undefined : sheetUp}
      className="absolute inset-x-0 bottom-0 flex-col overflow-hidden rounded-t-sheet bg-surface shadow-float"
    >
      {children}
    </Animated.View>
  );
}
