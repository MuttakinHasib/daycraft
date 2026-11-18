import { ActivityHue } from '@daycraft/domain';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { cn } from '@/lib/cn';

import { ActivityHueBackground, ActivityHueBorder } from './hues';
import { Icon } from './icon';
import { popIn } from './pop';

interface CheckRingProps {
  checked?: boolean;
  /** The activity's hue: the ring is drawn in it and fills with it when done. */
  hue?: ActivityHue;
  onPress?: () => void;
  /** "Complete: {title}" or "Mark not done: {title}". */
  accessibilityLabel: string;
}

/** 24pt ring with a 44pt touch target. */
export function CheckRing({ checked = false, hue = ActivityHue.SAGE, onPress, accessibilityLabel }: CheckRingProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      onPress={onPress}
      className={cn(
        'size-6 items-center justify-center rounded-full border-2 active:opacity-80',
        ActivityHueBorder[hue],
        { [ActivityHueBackground[hue]]: checked },
      )}
    >
      {checked && (
        <Animated.View entering={popIn}>
          <Icon name="check" size={14} strokeWidth={3.2} colorClassName="text-on-hue" />
        </Animated.View>
      )}
    </Pressable>
  );
}
