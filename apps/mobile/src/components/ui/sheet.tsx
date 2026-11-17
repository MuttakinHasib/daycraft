import type { ReactNode } from 'react';
import Animated, { Easing, withTiming } from 'react-native-reanimated';

import type { EntryExitAnimationFunction } from 'react-native-reanimated';

// Web equivalent: --animate-sheet-up: sheet-up 0.34s var(--ease-snap)
const sheetUp: EntryExitAnimationFunction = () => {
  'worklet';
  return {
    initialValues: {
      opacity: 0,
      transform: [{ translateY: 48 }],
    },
    animations: {
      opacity: withTiming(1, { duration: 220 }),
      transform: [
        { translateY: withTiming(0, { duration: 340, easing: Easing.bezier(0.2, 0.9, 0.25, 1) }) },
      ],
    },
  };
};

interface SheetProps {
  children: ReactNode;
}

export function Sheet({ children }: SheetProps) {
  return (
    <Animated.View
      entering={sheetUp}
      className="absolute inset-x-0 bottom-0 flex-col overflow-hidden rounded-t-sheet bg-surface shadow-float"
    >
      {children}
    </Animated.View>
  );
}
