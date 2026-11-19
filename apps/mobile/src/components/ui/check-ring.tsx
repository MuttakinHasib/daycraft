import { ActivityHue, type ActivityColor } from '@daycraft/domain';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { colorValue, inkClassOn, strokeColor } from './activity-color';
import { Icon } from './icon';
import { popIn } from './pop';

interface CheckRingProps {
  checked?: boolean;
  /** The activity's hue: the ring is drawn in it and fills with it when done. */
  hue?: ActivityColor;
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
      style={{ borderColor: strokeColor(hue), backgroundColor: checked ? colorValue(hue) : undefined }}
      className="size-6 items-center justify-center rounded-full border-2 active:opacity-80"
    >
      {checked && (
        <Animated.View entering={popIn}>
          <Icon name="check" size={14} strokeWidth={3.2} colorClassName={inkClassOn(hue)} />
        </Animated.View>
      )}
    </Pressable>
  );
}
