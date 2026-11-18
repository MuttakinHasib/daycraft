import { shadows, springs } from '@daycraft/design-tokens';
import { useEffect, useState } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { cn } from '@/lib/cn';
import { useColorScheme } from '@/theme/app-theme';

interface SegmentedOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface SegmentedProps<TValue extends string> {
  options: readonly SegmentedOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  /** Names the control for screen readers, e.g. "Task filter". */
  accessibilityLabel: string;
}

// Must match the track's p-0.75 and gap-0.5.
const TRACK_PADDING = 3;
const SEGMENT_GAP = 2;

/** A segmented control. It takes the options and the selected value and reports a new value through `onChange`. The selection springs between options. */
export function Segmented<TValue extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedProps<TValue>) {
  const [segmentWidth, setSegmentWidth] = useState(0);
  const offset = useSharedValue(0);
  const scheme = useColorScheme();
  const reduceMotion = useReducedMotion();
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const targetOffset = selectedIndex * (segmentWidth + SEGMENT_GAP);

  // With Reduce Motion on, the selection moves without the spring.
  useEffect(() => {
    if (segmentWidth > 0) offset.set(reduceMotion ? targetOffset : withSpring(targetOffset, springs.snap));
  }, [offset, segmentWidth, targetOffset, reduceMotion]);

  const onTrackLayout = (event: LayoutChangeEvent) => {
    const inner = event.nativeEvent.layout.width - TRACK_PADDING * 2 - SEGMENT_GAP * (options.length - 1);
    const width = inner / options.length;
    // The first measurement places the selection without animating it in from the left.
    offset.set(selectedIndex * (width + SEGMENT_GAP));
    setSegmentWidth(width);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [{ translateX: offset.get() }],
  }));

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      onLayout={onTrackLayout}
      className="flex-row gap-0.5 rounded-tile bg-sunken p-0.75"
    >
      {segmentWidth > 0 && (
        <Animated.View
          style={[indicatorStyle, { boxShadow: shadows.thumb[scheme] }]}
          className="absolute top-0.75 bottom-0.75 left-0.75 rounded-segment bg-raised"
        />
      )}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            hitSlop={{ top: 6, bottom: 6 }}
            onPress={() => onChange(option.value)}
            className="h-8 flex-1 items-center justify-center"
          >
            <Text className={cn('type-control', { 'text-ink-muted': !selected, 'text-ink': selected })}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
