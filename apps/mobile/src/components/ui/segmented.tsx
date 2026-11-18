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

/** Where the control sits: on a plain surface, or on a hue-tinted sheet header. */
export const SegmentedTone = {
  DEFAULT: 'default',
  /** On a sheet header band: a darker track and labels in the header's text color. */
  ON_HUE: 'onHue',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type SegmentedTone = (typeof SegmentedTone)[keyof typeof SegmentedTone];

interface SegmentedProps<TValue extends string> {
  options: readonly SegmentedOption<TValue>[];
  /** The selected value; a value matching no option shows no selection. */
  value: TValue;
  onChange: (value: TValue) => void;
  /** Names the control for screen readers, e.g. "Task filter". */
  accessibilityLabel: string;
  tone?: SegmentedTone;
  /** Shown at 50% and not pressable, for a setting that is not available yet. */
  disabled?: boolean;
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
  tone = SegmentedTone.DEFAULT,
  disabled = false,
}: SegmentedProps<TValue>) {
  const onHue = tone === SegmentedTone.ON_HUE;
  const [segmentWidth, setSegmentWidth] = useState(0);
  const offset = useSharedValue(0);
  const scheme = useColorScheme();
  const reduceMotion = useReducedMotion();
  const matchIndex = options.findIndex((option) => option.value === value);
  const hasSelection = matchIndex >= 0;
  const selectedIndex = Math.max(0, matchIndex);
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
      accessibilityState={{ disabled }}
      onLayout={onTrackLayout}
      className={cn('flex-row gap-0.5 rounded-tile p-0.75', {
        'bg-sunken': !onHue,
        'bg-ink/12': onHue,
        'opacity-50': disabled,
      })}
    >
      {segmentWidth > 0 && hasSelection && (
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
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            hitSlop={{ top: 6, bottom: 6 }}
            onPress={() => onChange(option.value)}
            className="h-8 flex-1 items-center justify-center"
          >
            <Text
              className={cn('type-control', {
                'text-ink-muted': !selected && !onHue,
                'text-ink': selected,
                'text-ink opacity-80 dark:text-on-hue': !selected && onHue,
              })}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
