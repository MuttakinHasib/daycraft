import { hueColors } from '@daycraft/design-tokens';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Line, Mask, Path, Rect } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { useThemeColors } from '@/theme/app-theme';

// The native launch screen (background only) stays up until this overlay has drawn the same frame.
void SplashScreen.preventAutoHideAsync();

interface AnimatedSplashProps {
  /** True once the app can show its first screen; the animation plays, then the overlay leaves. */
  ready: boolean;
}

interface LayerProps {
  origin: [number, number];
  style: AnimatedStyle<ViewStyle>;
  children: ReactNode;
}

const SUN = '#ffc233';
const SPLASH_MS = 2600;

// Matches app.json: expo-splash-screen draws splash-icon.png at imageWidth 200, and the PNG draws
// the mark at 94% of its height. Mark units are the 100-unit drawing; its centre is (50, 49.3).
const MARK_SIZE = 200;
const UNIT = (MARK_SIZE * 0.94) / 79.5;
const VIEW_BOX = `${50 - 100 / UNIT} ${49.3 - 100 / UNIT} ${200 / UNIT} ${200 / UNIT}`;

const RAY_ANGLES = [150, 90, 30];
const RAYS = RAY_ANGLES.map((angle) => {
  const rad = (angle * Math.PI) / 180;
  return {
    x1: 33 + 13 * Math.cos(rad),
    y1: 28 - 13 * Math.sin(rad),
    x2: 33 + 17.5 * Math.cos(rad),
    y2: 28 - 17.5 * Math.sin(rad),
  };
});

/** A mark-unit point as a transform origin inside the 200pt mark box. */
function origin([x, y]: [number, number]): string {
  return `${MARK_SIZE / 2 + (x - 50) * UNIT}px ${MARK_SIZE / 2 + (y - 49.3) * UNIT}px`;
}

/** One animated part of the mark, drawn in the same box as the native splash image. */
function Layer({ origin: point, style, children }: LayerProps) {
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transformOrigin: origin(point) }, style]}>
      <Svg width={MARK_SIZE} height={MARK_SIZE} viewBox={VIEW_BOX}>
        {children}
      </Svg>
    </Animated.View>
  );
}

/**
 * The launch animation ("the day builds itself", canvas board 18). The native launch screen shows
 * only the background, so the mark builds from nothing: the blue block and green chip drop in, the
 * pen slides up, the sun rises and its rays pop, the wordmark fades up, then everything fades into
 * the app. 2.6s; Reduce Motion shows the full lockup and only fades.
 */
export function AnimatedSplash({ ready }: AnimatedSplashProps) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const [drawn, setDrawn] = useState(false);
  const [done, setDone] = useState(false);

  // Each part goes from 0 (hidden, offset) to 1 (in place).
  const blue = useSharedValue(0);
  const green = useSharedValue(0);
  const pen = useSharedValue(0);
  const sun = useSharedValue(0);
  const ray0 = useSharedValue(0);
  const ray1 = useSharedValue(0);
  const ray2 = useSharedValue(0);
  const word = useSharedValue(0);
  const out = useSharedValue(0);

  useEffect(() => {
    if (!ready || !drawn) return;
    const finish = (finished?: boolean) => {
      'worklet';
      if (finished) scheduleOnRN(setDone, true);
    };
    const parts = [blue, green, pen, sun, ray0, ray1, ray2, word];
    if (reduceMotion) {
      parts.forEach((part) => part.set(1));
      out.set(withDelay(400, withTiming(1, { duration: 300 }, finish)));
      return;
    }
    // Timings follow the canvas keyframes, as fractions of the 2.6s run.
    const at = (fraction: number) => Math.round(SPLASH_MS * fraction);
    const bounce = Easing.bezier(0.34, 1.56, 0.64, 1);
    const settle = Easing.bezier(0.2, 0.8, 0.2, 1);
    blue.set(withTiming(1, { duration: at(0.14), easing: bounce }));
    green.set(withDelay(at(0.06), withTiming(1, { duration: at(0.14), easing: bounce })));
    pen.set(withDelay(at(0.12), withTiming(1, { duration: at(0.22), easing: settle })));
    sun.set(withDelay(at(0.22), withTiming(1, { duration: at(0.16), easing: settle })));
    [ray0, ray1, ray2].forEach((ray, index) =>
      ray.set(withDelay(at(0.37) + 70 * index, withTiming(1, { duration: at(0.1), easing: bounce }))),
    );
    word.set(withDelay(at(0.48), withTiming(1, { duration: at(0.14), easing: Easing.out(Easing.quad) })));
    out.set(withDelay(at(0.86), withTiming(1, { duration: at(0.14), easing: Easing.in(Easing.quad) }, finish)));
  }, [ready, drawn, reduceMotion, blue, green, pen, sun, ray0, ray1, ray2, word, out]);

  const rootStyle = useAnimatedStyle(() => ({ opacity: 1 - out.get() }));
  const lockupStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.04 * out.get() }] }));
  // Opacity reaches 1 early in each move, as in the canvas keyframes.
  const shown = (value: number) => {
    'worklet';
    return Math.min(1, value * 6);
  };
  const blueStyle = useAnimatedStyle(() => ({
    opacity: shown(blue.get()),
    transform: [{ translateY: -16 * UNIT * (1 - blue.get()) }],
  }));
  const greenStyle = useAnimatedStyle(() => ({
    opacity: shown(green.get()),
    transform: [{ translateY: -16 * UNIT * (1 - green.get()) }],
  }));
  const penStyle = useAnimatedStyle(() => ({
    opacity: shown(pen.get()),
    transform: [{ translateY: 30 * UNIT * (1 - pen.get()) }],
  }));
  const sunStyle = useAnimatedStyle(() => ({
    opacity: shown(sun.get()),
    transform: [{ translateY: 12 * UNIT * (1 - sun.get()) }],
  }));
  const ray0Style = useAnimatedStyle(() => ({ opacity: shown(ray0.get()), transform: [{ scale: ray0.get() }] }));
  const ray1Style = useAnimatedStyle(() => ({ opacity: shown(ray1.get()), transform: [{ scale: ray1.get() }] }));
  const ray2Style = useAnimatedStyle(() => ({ opacity: shown(ray2.get()), transform: [{ scale: ray2.get() }] }));
  const rayStyles = [ray0Style, ray1Style, ray2Style];
  const wordStyle = useAnimatedStyle(() => ({
    opacity: word.get(),
    transform: [{ translateY: (1 - word.get()) * 8 }],
  }));

  const onLayout = () => {
    if (drawn) return;
    setDrawn(true);
    // The overlay now shows the launch screen's frame (the plain background), so the native screen can go.
    requestAnimationFrame(() => SplashScreen.hide());
  };

  if (done) return null;
  return (
    <Animated.View
      onLayout={onLayout}
      accessibilityLabel="Daycraft"
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.canvas, zIndex: 1000 }, rootStyle]}
      className="items-center justify-center"
    >
      <Animated.View style={[{ width: MARK_SIZE, height: MARK_SIZE }, lockupStyle]}>
        <Layer origin={[33, 87]} style={blueStyle}>
          <Rect x={20} y={64} width={26} height={23} rx={11.5} fill={hueColors.sky} />
        </Layer>
        <Layer origin={[33, 60]} style={greenStyle}>
          <Rect x={20} y={45} width={26} height={15} rx={7.5} fill={hueColors.sage} />
        </Layer>
        <Layer origin={[67, 89]} style={penStyle}>
          <Defs>
            <Mask id="nib" maskUnits="userSpaceOnUse" x={0} y={0} width={100} height={100}>
              <Rect x={0} y={0} width={100} height={100} fill="#ffffff" />
              <Rect x={66} y={74} width={2} height={11} rx={1} fill="#000000" />
              <Circle cx={67} cy={74} r={2.6} fill="#000000" />
            </Mask>
          </Defs>
          <G mask="url(#nib)">
            <Rect x={54} y={12} width={26} height={52} rx={13} fill={hueColors.clay} />
            <Path d="M54 68H80L71.5 84Q67 91 62.5 84Z" fill={hueColors.clay} />
          </G>
        </Layer>
        <Layer origin={[33, 28]} style={sunStyle}>
          <Circle cx={33} cy={28} r={10} fill={SUN} />
        </Layer>
        {RAYS.map((ray, index) => (
          <Layer key={RAY_ANGLES[index]} origin={[ray.x1, ray.y1]} style={rayStyles[index]}>
            <Line
              x1={ray.x1}
              y1={ray.y1}
              x2={ray.x2}
              y2={ray.y2}
              stroke={SUN}
              strokeWidth={3.5}
              strokeLinecap="round"
            />
          </Layer>
        ))}
        <Animated.View style={[{ position: 'absolute', top: MARK_SIZE + 4, left: 0, right: 0 }, wordStyle]}>
          <Text className="type-title text-center text-ink">daycraft</Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
