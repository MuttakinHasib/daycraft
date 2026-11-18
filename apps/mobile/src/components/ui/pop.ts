import { durations, popScale } from '@daycraft/design-tokens';
import { Keyframe } from 'react-native-reanimated';

const [from, overshoot, to] = popScale;

/**
 * The `pop` entrance: scale 0.6, then 1.12, then 1. Used for check marks and new capsules.
 * Reanimated skips entering animations when Reduce Motion is on.
 */
export const popIn = new Keyframe({
  0: { transform: [{ scale: from }] },
  55: { transform: [{ scale: overshoot }] },
  100: { transform: [{ scale: to }] },
}).duration(durations.pop);
