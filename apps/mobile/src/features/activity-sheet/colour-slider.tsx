import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';

interface ColourSliderProps {
  /** 0–1 along the track. */
  value: number;
  onChange: (value: number) => void;
  /** The track's CSS gradient, left to right. */
  gradient: string;
  /** The thumb's fill: the color at the thumb. */
  thumbColor: string;
  accessibilityLabel: string;
}

const THUMB = 30;
const STEP = 0.05;

/** A gradient track with a round thumb: drag or tap along it; screen readers step it in 5% increments. */
export function ColourSlider({ value, onChange, gradient, thumbColor, accessibilityLabel }: ColourSliderProps) {
  const [width, setWidth] = useState(0);
  const valueAt = (x: number) => (width > 0 ? Math.min(1, Math.max(0, x / width)) : value);
  const pan = usePanGesture({
    minDistance: 0,
    runOnJS: true,
    onActivate: (event) => onChange(valueAt(event.x)),
    onUpdate: (event) => onChange(valueAt(event.x)),
  });
  const step = (direction: 1 | -1) => onChange(Math.min(1, Math.max(0, value + direction * STEP)));
  return (
    <GestureDetector gesture={pan}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) => step(event.nativeEvent.actionName === 'increment' ? 1 : -1)}
        onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
        style={{ height: THUMB }}
        className="justify-center"
      >
        <View style={{ backgroundImage: gradient }} className="h-6 rounded-full" />
        <View
          pointerEvents="none"
          style={{ left: value * width - THUMB / 2, width: THUMB, height: THUMB, backgroundColor: thumbColor }}
          className="absolute rounded-full border-3 border-on-hue"
        />
      </View>
    </GestureDetector>
  );
}
