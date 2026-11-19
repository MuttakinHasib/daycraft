import { usePanGesture } from 'react-native-gesture-handler';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// A swipe counts once the finger travels this far, or flicks this fast.
const SWIPE_DISTANCE = 50;
const SWIPE_VELOCITY = 500;
// The content follows the finger at this fraction, then settles back.
const FOLLOW = 0.35;

/**
 * A horizontal swipe that pages by one step: left is next (+1), right is previous (−1).
 * Vertical scrolling still wins; the content follows the finger a little while it moves.
 */
export function useHorizontalSwipe(onPage: (step: 1 | -1) => void) {
  const offset = useSharedValue(0);
  const gesture = usePanGesture({
    activeOffsetX: [-12, 12],
    failOffsetY: [-12, 12],
    runOnJS: true,
    onUpdate: (event) => offset.set(event.translationX * FOLLOW),
    onDeactivate: (event) => {
      offset.set(withTiming(0, { duration: 180 }));
      if (event.canceled) return;
      const { translationX, velocityX } = event;
      if (translationX <= -SWIPE_DISTANCE || velocityX <= -SWIPE_VELOCITY) onPage(1);
      else if (translationX >= SWIPE_DISTANCE || velocityX >= SWIPE_VELOCITY) onPage(-1);
    },
  });
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: offset.get() }] }));
  return { gesture, style };
}
