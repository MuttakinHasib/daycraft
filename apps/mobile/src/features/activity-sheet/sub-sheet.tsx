import { durations, radii, shadows } from '@daycraft/design-tokens';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, IconButtonSize } from '@/components/ui';

const PANEL_MAX_HEIGHT = '90%';
// The card floats this far inside the screen edges.
const FLOAT_INSET = 8;

interface SubSheetProps {
  onClose: () => void;
  children: ReactNode;
}

interface SubSheetHeaderProps {
  title: string;
  onClose: () => void;
  /** Sits between the title and ×, such as a Today button. */
  aside?: ReactNode;
}

/**
 * A small sheet over the activity sheet (date, time, repeat, priority, colour, location): a card that floats
 * inset from the screen edges with all corners rounded, over a scrim. Tapping the scrim closes it. Sheets can
 * stack (a second one opens over the first). Reduce Motion drops the slide (Reanimated follows the system).
 */
export function SubSheet({ onClose, children }: SubSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="absolute inset-0 z-50 justify-end">
      <Animated.View
        entering={FadeIn.duration(durations.fadeIn)}
        exiting={FadeOut.duration(durations.fadeIn)}
        className="absolute inset-0 bg-scrim"
      >
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} className="flex-1" />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        entering={SlideInDown.duration(durations.sheetUp)}
        exiting={SlideOutDown.duration(durations.fadeIn)}
        // Tall panels (colour and icon) scroll inside the space they have. The radius is set here, not as a
        // class: the animated panel drops class-based corners.
        style={{
          maxHeight: PANEL_MAX_HEIGHT,
          margin: FLOAT_INSET,
          borderRadius: radii.sheet.px,
          overflow: 'hidden',
          boxShadow: shadows.lift,
        }}
        className="bg-surface"
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom - FLOAT_INSET, 16) }}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

/** The sub-sheet's title row: title, an optional action and ×. */
export function SubSheetHeader({ title, onClose, aside }: SubSheetHeaderProps) {
  return (
    <View className="flex-row items-center gap-2 px-5 pt-6 pb-4">
      <Text accessibilityRole="header" className="flex-1 type-heading text-ink">
        {title}
      </Text>
      {aside}
      <IconButton icon="x" size={IconButtonSize.LG} accessibilityLabel="Close" onPress={onClose} />
    </View>
  );
}
