import { glass, springs, withOpacity } from '@daycraft/design-tokens';
import type { IconName } from '@daycraft/domain';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { useEffect, type ReactNode } from 'react';
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

// Checked once: Liquid Glass needs iOS 26; elsewhere the pill is frosted.
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

/** What the center + creates; its label follows the focused tab. */
const CreateAction = {
  NEW_TASK: 'New task',
  NEW_HABIT: 'New habit',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
type CreateAction = (typeof CreateAction)[keyof typeof CreateAction];

/** The tab routes in `app/(tabs)`, by file name. */
export const TabRoute = {
  PLAN: 'index',
  HABITS: 'habits',
  GOALS: 'goals',
  MORE: 'more',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type TabRoute = (typeof TabRoute)[keyof typeof TabRoute];

// The one source of tab labels and icons. The + sits after the second tab.
const TAB_ITEMS: Record<TabRoute, TabItem> = {
  [TabRoute.PLAN]: { label: 'Plan', icon: 'timeline' },
  [TabRoute.HABITS]: { label: 'Habits', icon: 'flame' },
  [TabRoute.GOALS]: { label: 'Goals', icon: 'target' },
  [TabRoute.MORE]: { label: 'More', icon: 'grid' },
};

const TABS_BEFORE_CREATE = 2;

function isTabRoute(name: string): name is TabRoute {
  return name in TAB_ITEMS;
}

function createActionFor(routeName: string | undefined): CreateAction {
  return routeName === TabRoute.HABITS ? CreateAction.NEW_HABIT : CreateAction.NEW_TASK;
}

function TabButton({ item, focused, onPress, onLayout }: TabButtonProps) {
  const color = cn({ 'text-on-accent': focused, 'text-ink-muted': !focused });
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      onLayout={onLayout}
      className="h-13 flex-1 items-center justify-center gap-0.75 rounded-full"
    >
      <Icon name={item.icon} size={22} colorClassName={color} />
      <Text className={cn('type-micro', color)}>{item.label}</Text>
    </Pressable>
  );
}

// Inert until ticket 07 opens the editor; it keeps the design's full color meanwhile.
function CreateButton({ action }: CreateButtonProps) {
  return (
    <Pressable
      disabled
      accessibilityRole="button"
      accessibilityLabel={action}
      accessibilityState={{ disabled: true }}
      className="size-13 items-center justify-center rounded-full bg-ink"
    >
      <Icon name="plus" size={26} strokeWidth={2.4} colorClassName="text-canvas" />
    </Pressable>
  );
}

const PILL_CLASS = 'absolute inset-0 rounded-full p-1.5';

/**
 * Liquid Glass where the OS has it; everywhere else a frosted pill. Android blurs only through a
 * `BlurTargetView`, so there the veil sits over a translucent view instead of a live blur.
 */
function Pill({ children }: PillProps) {
  const scheme = useColorScheme();
  const colors = useThemeColors();
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
        style={{ borderColor: glass.edge[scheme], borderTopColor: glass.highlight[scheme] }}
        className="absolute inset-0 overflow-hidden rounded-full border"
      >
        <BlurView intensity={glass.nativeBlurIntensity} tint={BLUR_TINT[scheme]} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: withOpacity(colors.elevated, glass.veil) }]} />
      </View>
      {children}
    </View>
  );
}

/** The solid accent pill behind the focused tab; it glides to the next tab with the snap spring. */
function Selection({ x, width }: SelectionProps) {
  const style = useAnimatedStyle(() => ({
    width: width.get(),
    transform: [{ translateX: x.get() }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={style}
      className="absolute top-0 bottom-0 left-0 rounded-full bg-accent"
    />
  );
}

/** The v2 floating pill: Plan · Habits · + · Goals · More (ADR-0003). */
export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const routes = state.routes.filter((route) => isTabRoute(route.name));
  const focusedKey = state.routes[state.index]?.key;
  const focusedIndex = routes.findIndex((route) => route.key === focusedKey);
  const action = createActionFor(state.routes[state.index]?.name);

  const slots = useSharedValue<Slot[]>([]);
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

  useEffect(() => {
    const slot = slots.get()[focusedIndex];
    if (!slot) return;
    selectionX.set(reduceMotion ? slot.x : withSpring(slot.x, springs.snap));
    selectionWidth.set(reduceMotion ? slot.width : withSpring(slot.width, springs.snap));
  }, [focusedIndex, slots, selectionX, selectionWidth, reduceMotion]);

  const onSlotLayout = (index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    slots.modify((current) => {
      'worklet';
      current[index] = { x, width };
      return current;
    });
    // The first measurement places the selection without animating it in.
    if (index === focusedIndex) {
      selectionX.set(x);
      selectionWidth.set(width);
    }
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
    <View pointerEvents="box-none" className="absolute inset-x-4 bottom-safe-offset-6 h-16">
      <Pill>
        <View className="flex-1 flex-row items-center">
          <Selection x={selectionX} width={selectionWidth} />
          {tabs.slice(0, TABS_BEFORE_CREATE)}
          <View className="w-18" />
          {tabs.slice(TABS_BEFORE_CREATE)}
        </View>
      </Pill>
      {/* The + sits over the pill's center gap, so it can stand taller than the tabs. */}
      <View pointerEvents="box-none" className="absolute inset-0 items-center justify-center">
        <CreateButton action={action} />
      </View>
    </View>
  );
}
