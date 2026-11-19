import { durations } from '@daycraft/design-tokens';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { IconButton, IconButtonSize } from '@/components/ui';

const PANEL_MAX_HEIGHT = '90%';

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
 * A small sheet over the activity sheet (date, time, priority, colour, location): a scrim and a panel that slides
 * up from the bottom. Tapping the scrim closes it. Reduce Motion drops the slide (Reanimated follows the system).
 */
export function SubSheet({ onClose, children }: SubSheetProps) {
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
        // Tall panels (colour and icon) scroll inside the space the activity sheet has.
        style={{ maxHeight: PANEL_MAX_HEIGHT }}
        className="overflow-hidden rounded-t-sheet bg-surface"
      >
        <ScrollView bounces={false} contentContainerClassName="pb-safe">
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
