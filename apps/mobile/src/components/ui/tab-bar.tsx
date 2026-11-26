import { glass, springs, withOpacity } from '@daycraft/design-tokens';
import type { IconName } from '@daycraft/domain';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

import { cn } from '@/lib/cn';
import { useColorScheme, useThemeColors } from '@/theme/app-theme';

import { Icon } from './icon';

const ThemedGlassView = withUniwind(GlassView);

// Read once at load. Liquid Glass needs iOS 26; elsewhere the pill is frosted. The + is always solid.
const LIQUID_GLASS = isLiquidGlassAvailable();

// iOS blur materials under the frosted fallback; the values come from the `glass` token.
const BLUR_TINT = {
  light: 'systemUltraThinMaterialLight',
  dark: 'systemUltraThinMaterialDark',
} as const;

interface TabItem {
  label: string;
  icon: IconName;
}

interface TabButtonProps {
  item: TabItem;
  focused: boolean;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
}

interface CreateButtonProps {
  action: CreateAction;
  onPress: () => void;
}

interface TabBarProps extends BottomTabBarProps {
  /** What the + does for the focused tab's action. */
  onCreate: (action: CreateAction) => void;
}

interface PillProps {
  children: ReactNode;
}

interface SelectionProps {
  x: SharedValue<number>;
  width: SharedValue<number>;
}

/** A tab's position in the tab row, from its layout. */
interface Slot {
  x: number;
  width: number;
}

/** What the + creates; its label follows the focused tab. */
export const CreateAction = {
  NEW_TASK: 'New task',
  NEW_HABIT: 'New habit',
  NEW_GOAL: 'New goal',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type CreateAction = (typeof CreateAction)[keyof typeof CreateAction];

/** The tab routes in `app/(tabs)`, by file name. */
export const TabRoute = {
  PLAN: 'index',
  HABITS: 'habits',
  GOALS: 'goals',
  MORE: 'more',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type TabRoute = (typeof TabRoute)[keyof typeof TabRoute];

// The one source of tab labels and icons, in order. The + floats to the right of the pill.
const TAB_ITEMS: Record<TabRoute, TabItem> = {
  [TabRoute.PLAN]: { label: 'Plan', icon: 'timeline' },
  [TabRoute.HABITS]: { label: 'Habits', icon: 'flame' },
  [TabRoute.GOALS]: { label: 'Goals', icon: 'target' },
  [TabRoute.MORE]: { label: 'More', icon: 'grid' },
};

function isTabRoute(name: string): name is TabRoute {
  return name in TAB_ITEMS;
}

function createActionFor(routeName: string | undefined): CreateAction {
  if (routeName === TabRoute.HABITS) return CreateAction.NEW_HABIT;
  if (routeName === TabRoute.GOALS) return CreateAction.NEW_GOAL;
  return CreateAction.NEW_TASK;
}

function TabButton({ item, focused, onPress, onLayout }: TabButtonProps) {
  const color = cn({ 'text-ink': focused, 'text-ink-subtle': !focused });
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      onLayout={onLayout}
      className="h-12.5 flex-1 items-center justify-center gap-0.75 rounded-full"
    >
      <Icon name={item.icon} size={22} colorClassName={color} />
      <Text className={cn('type-micro', color)}>{item.label}</Text>
    </Pressable>
  );
}

// The bar's one colored element: a solid accent circle beside the pill.
function CreateButton({ action, onPress }: CreateButtonProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={action}
      style={{
        boxShadow: `inset 0 1px 0 ${glass.plus.highlight}, ${glass.plus.glow} ${withOpacity(colors.accent, glass.plus.glowOpacity)}`,
      }}
      className="size-14 items-center justify-center rounded-full bg-accent active:opacity-85"
    >
      <Icon name="plus" size={26} strokeWidth={2.4} colorClassName="text-on-accent" />
    </Pressable>
  );
}

const PILL_CLASS = 'h-15 flex-1 rounded-full p-1.25';

/**
 * Liquid Glass where the OS has it; everywhere else a frosted pill. Android blurs only through a
 * `BlurTargetView`, so there the veil sits over a translucent view instead of a live blur.
 */
function Pill({ children }: PillProps) {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const veil = glass.veil[scheme];
  if (LIQUID_GLASS) {
    return (
      <ThemedGlassView accessibilityRole="tablist" colorScheme={scheme} className={PILL_CLASS}>
        {children}
      </ThemedGlassView>
    );
  }
  return (
    <View accessibilityRole="tablist" style={{ boxShadow: glass.shadow[scheme] }} className={PILL_CLASS}>
      <View
        pointerEvents="none"
        style={{
          borderColor: glass.edge[scheme],
          borderTopColor: glass.highlight[scheme],
        }}
        className="absolute inset-0 overflow-hidden rounded-full border"
      >
        <BlurView intensity={glass.nativeBlurIntensity} tint={BLUR_TINT[scheme]} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: withOpacity(colors[veil.color], veil.opacity) }]} />
      </View>
      {children}
    </View>
  );
}

/** The translucent pill behind the focused tab. It springs to the next tab with `springs.snap`. */
function Selection({ x, width }: SelectionProps) {
  const scheme = useColorScheme();
  const style = useAnimatedStyle(() => ({
    width: width.get(),
    transform: [{ translateX: x.get() }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[style, { backgroundColor: glass.selection[scheme] }]}
      className="absolute top-0 bottom-0 left-0 rounded-full"
    />
  );
}

/** The `canvas` fade behind the bar, so content fades out before it reaches the bar. */
function Fade() {
  const colors = useThemeColors();
  const solid = `${glass.fadeSolidStop * 100}%`;
  return (
    <View
      pointerEvents="none"
      style={{
        height: glass.fadeHeight,
        backgroundImage: `linear-gradient(to top, ${colors.canvas} ${solid}, ${withOpacity(colors.canvas, 0)})`,
      }}
      className="absolute inset-x-0 bottom-0"
    />
  );
}

/** The floating pill Plan · Habits · Goals · More with the + beside it (ADR-0003, ADR-0009). */
export function TabBar({ state, emitter, navigateToTab, onCreate }: TabBarProps) {
  const routes = state.routes.filter((route) => isTabRoute(route.name));
  const focusedKey = state.routes[state.index]?.key;
  const focusedIndex = routes.findIndex((route) => route.key === focusedKey);
  const action = createActionFor(state.routes[state.index]?.name);

  // Slot positions are only read on the JS side, so they live in React state, not a shared value.
  const [slots, setSlots] = useState<Slot[]>([]);
  const placed = useRef(false);
  const selectionX = useSharedValue(0);
  const selectionWidth = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  const selectTab = (index: number) => {
    const route = routes[index];
    if (!route) return;
    const event = emitter.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (route.key !== focusedKey && !event.defaultPrevented) navigateToTab(route.key);
  };

  // Only this effect moves the selection. It jumps on the first measurement or with Reduce Motion on,
  // and springs after that.
  useEffect(() => {
    const slot = slots[focusedIndex];
    if (!slot) return;
    const jump = reduceMotion || !placed.current;
    placed.current = true;
    selectionX.set(jump ? slot.x : withSpring(slot.x, springs.snap));
    selectionWidth.set(jump ? slot.width : withSpring(slot.width, springs.snap));
  }, [focusedIndex, slots, selectionX, selectionWidth, reduceMotion]);

  const onSlotLayout = (index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setSlots((current) => {
      const previous = current[index];
      if (previous && previous.x === x && previous.width === width) return current;
      const next = [...current];
      next[index] = { x, width };
      return next;
    });
  };

  const tabs = routes.map((route, index) =>
    isTabRoute(route.name) ? (
      <TabButton
        key={route.key}
        item={TAB_ITEMS[route.name]}
        focused={index === focusedIndex}
        onPress={() => selectTab(index)}
        onLayout={(event) => onSlotLayout(index, event)}
      />
    ) : null,
  );

  return (
    <>
      <Fade />
      <View pointerEvents="box-none" className="absolute inset-x-4 bottom-6 flex-row items-center gap-4">
        <Pill>
          <View className="flex-1 flex-row items-center">
            <Selection x={selectionX} width={selectionWidth} />
            {tabs}
          </View>
        </Pill>
        <CreateButton action={action} onPress={() => onCreate(action)} />
      </View>
    </>
  );
}
