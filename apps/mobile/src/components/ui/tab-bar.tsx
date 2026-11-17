import { springs } from '@daycraft/design-tokens';
import type { IconName } from '@daycraft/domain';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { withUniwind } from 'uniwind';

import { cn } from '@/lib/cn';
import { useColorScheme, useThemeColors } from '@/theme/app-theme';

import { Icon } from './icon';

const ThemedGlassView = withUniwind(GlassView);

// Checked once: Liquid Glass needs iOS 26; elsewhere the pill and lens are solid.
const LIQUID_GLASS = isLiquidGlassAvailable();

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

interface LensProps {
  x: SharedValue<number>;
  width: SharedValue<number>;
  press: SharedValue<number>;
  stretch: SharedValue<number>;
  pressing: boolean;
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

// How much the lens swells under a finger, and how far fast drags stretch it.
const LENS_GROW = 0.12;
const LENS_MAX_STRETCH = 0.35;
const LENS_STRETCH_VELOCITY = 2500;

function isTabRoute(name: string): name is TabRoute {
  return name in TAB_ITEMS;
}

function createActionFor(routeName: string | undefined): CreateAction {
  return routeName === TabRoute.HABITS ? CreateAction.NEW_HABIT : CreateAction.NEW_TASK;
}

function nearestSlot(slots: Slot[], center: number): number {
  'worklet';
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  slots.forEach((slot, index) => {
    const distance = Math.abs(slot.x + slot.width / 2 - center);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
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

/** Liquid Glass where the OS has it, the v2 solid elevated pill everywhere else. */
function Pill({ children }: PillProps) {
  const scheme = useColorScheme();
  if (LIQUID_GLASS) {
    return (
      <ThemedGlassView accessibilityRole="tablist" colorScheme={scheme} className={PILL_CLASS}>
        {children}
      </ThemedGlassView>
    );
  }
  return (
    <View accessibilityRole="tablist" className={cn(PILL_CLASS, 'border border-line bg-elevated shadow-float')}>
      {children}
    </View>
  );
}

/**
 * The accent pill behind the focused tab. Under a finger it swells, turns to accent-tinted glass
 * and stretches with drag speed; released, it wobbles onto the nearest tab.
 */
function Lens({ x, width, press, stretch, pressing }: LensProps) {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const lensStyle = useAnimatedStyle(() => {
    const grow = 1 + LENS_GROW * press.get();
    const pull = stretch.get();
    return {
      width: width.get(),
      transform: [{ translateX: x.get() }, { scaleX: grow * pull }, { scaleY: grow / Math.sqrt(pull) }],
    };
  });
  // On glass the solid fill gives way to the tinted lens; without glass it only lightens.
  const fillStyle = useAnimatedStyle(() => ({ opacity: 1 - press.get() * (LIQUID_GLASS ? 1 : 0.3) }));

  return (
    <Animated.View pointerEvents="none" style={lensStyle} className="absolute top-0 bottom-0 left-0">
      <Animated.View style={fillStyle} className="absolute inset-0 rounded-full bg-accent" />
      {LIQUID_GLASS && (
        <ThemedGlassView
          glassEffectStyle={{ style: pressing ? 'clear' : 'none', animate: true }}
          tintColor={colors.accent}
          colorScheme={scheme}
          className="absolute inset-0 rounded-full"
        />
      )}
    </Animated.View>
  );
}

/** The v2 floating pill: Plan · Habits · + · Goals · More (ADR-0003), with a draggable glass lens. */
export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const routes = state.routes.filter((route) => isTabRoute(route.name));
  const focusedKey = state.routes[state.index]?.key;
  const focusedIndex = routes.findIndex((route) => route.key === focusedKey);
  const action = createActionFor(state.routes[state.index]?.name);

  const slots = useSharedValue<Slot[]>([]);
  const lensX = useSharedValue(0);
  const lensWidth = useSharedValue(0);
  const press = useSharedValue(0);
  const stretch = useSharedValue(1);
  const [pressing, setPressing] = useState(false);
  const reduceMotion = useReducedMotion();

  const selectTab = (index: number) => {
    const route = routes[index];
    if (!route) return;
    const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (route.key !== focusedKey && !event.defaultPrevented) navigateToTab(route.key);
  };

  // Navigation that doesn't come from a drag (VoiceOver, deep links) still moves the lens.
  useEffect(() => {
    const slot = slots.get()[focusedIndex];
    if (!slot) return;
    lensX.set(withSpring(slot.x, springs.snap));
    lensWidth.set(withSpring(slot.width, springs.snap));
  }, [focusedIndex, slots, lensX, lensWidth]);

  const onSlotLayout = (index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    slots.modify((current) => {
      'worklet';
      current[index] = { x, width };
      return current;
    });
    // The first measurement places the lens without animating it in.
    if (index === focusedIndex) {
      lensX.set(x);
      lensWidth.set(width);
    }
  };

  const followFinger = (fingerX: number) => {
    'worklet';
    const all = slots.get();
    const first = all[0];
    const last = all[all.length - 1];
    if (!first || !last) return;
    const lensW = lensWidth.get();
    lensX.set(Math.min(Math.max(fingerX - lensW / 2, first.x), last.x + last.width - lensW));
  };

  const pan = usePanGesture({
    minDistance: 0,
    onBegin: (event) => {
      'worklet';
      if (!reduceMotion) press.set(withSpring(1, springs.snap));
      scheduleOnRN(setPressing, true);
      followFinger(event.x);
    },
    onUpdate: (event) => {
      'worklet';
      followFinger(event.x);
      if (!reduceMotion) {
        const pull = Math.min(Math.abs(event.velocityX) / LENS_STRETCH_VELOCITY, LENS_MAX_STRETCH);
        stretch.set(withSpring(1 + pull, springs.snap));
      }
    },
    onFinalize: (event) => {
      'worklet';
      const all = slots.get();
      const target = event.canceled ? focusedIndex : nearestSlot(all, lensX.get() + lensWidth.get() / 2);
      const slot = all[target];
      if (slot) lensX.set(withSpring(slot.x, reduceMotion ? springs.snap : springs.jelly));
      press.set(withSpring(0, springs.jelly));
      stretch.set(withSpring(1, springs.jelly));
      scheduleOnRN(setPressing, false);
      if (!event.canceled) scheduleOnRN(selectTab, target);
    },
  });

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
        <GestureDetector gesture={pan}>
          <View className="flex-1 flex-row items-center">
            <Lens x={lensX} width={lensWidth} press={press} stretch={stretch} pressing={pressing} />
            {tabs.slice(0, TABS_BEFORE_CREATE)}
            <View className="w-18" />
            {tabs.slice(TABS_BEFORE_CREATE)}
          </View>
        </GestureDetector>
      </Pill>
      {/* Above the pill and outside the drag area, so the + keeps its own touches. */}
      <View pointerEvents="box-none" className="absolute inset-0 items-center justify-center">
        <CreateButton action={action} />
      </View>
    </View>
  );
}
