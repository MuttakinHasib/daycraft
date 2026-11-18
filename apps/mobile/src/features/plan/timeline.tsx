import { hueColors } from '@daycraft/design-tokens';
import {
  formatClock,
  formatHour,
  SpineKind,
  type DayLayout,
  type MinutesOfDay,
  type SpineSegment,
} from '@daycraft/domain';
import type { ComponentRef, Ref } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Chip, ChipTone } from '@/components/ui';
import { useThemeColors } from '@/theme/app-theme';

import { ROW_TRANSITION, TimelineRow } from './timeline-row';

const DASH = 5;

interface TimelineProps {
  layout: DayLayout;
  scrollRef?: Ref<ComponentRef<typeof ScrollView>>;
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
  onCreateAt: (start: MinutesOfDay) => void;
  onPlanDay: () => void;
}

interface SpineProps {
  segment: SpineSegment;
}

/** One stretch of spine between two capsules: a hue gradient, or dashes for a long gap (timeline guide §5). */
function Spine({ segment }: SpineProps) {
  const colors = useThemeColors();
  const dashes = segment.kind === SpineKind.DASHED ? Math.ceil(segment.height / (DASH * 2)) : 0;
  return (
    <Animated.View
      layout={ROW_TRANSITION}
      pointerEvents="none"
      style={{
        top: segment.top,
        height: segment.height,
        opacity: segment.dimmed ? 0.45 : 1,
        backgroundImage:
          segment.kind === SpineKind.GRADIENT
            ? `linear-gradient(to bottom, ${hueColors[segment.fromHue]}, ${hueColors[segment.toHue]})`
            : undefined,
      }}
      className="absolute left-18.75 w-0.5 overflow-hidden"
    >
      {Array.from({ length: dashes }, (_, index) => (
        <View
          key={index}
          style={{ top: index * DASH * 2, height: DASH, backgroundColor: colors['line-strong'] }}
          className="absolute inset-x-0"
        />
      ))}
    </Animated.View>
  );
}

/** The Plan timeline: renders `layoutDay`'s output and holds no layout logic of its own. */
export function Timeline({ layout, scrollRef, onOpen, onToggle, onCreateAt, onPlanDay }: TimelineProps) {
  const empty = layout.rows.length === 0;
  return (
    <ScrollView ref={scrollRef} className="flex-1" showsVerticalScrollIndicator={false}>
      <View style={{ height: layout.contentHeight }}>
        {layout.slots.map((slot) => (
          <Pressable
            key={slot.start}
            accessibilityRole="button"
            accessibilityLabel={`Add something at ${formatClock(slot.start)}`}
            onPress={() => onCreateAt(slot.start)}
            style={{ top: slot.top, height: slot.height }}
            className="absolute right-3 left-13 rounded-tile active:bg-accent-soft"
          />
        ))}
        {!empty &&
          layout.hours.map((label) => (
            <View key={label.hour} pointerEvents="none" style={{ top: label.y }} className="absolute right-5 left-0">
              <Text
                style={{ fontVariant: ['tabular-nums'] }}
                className="absolute -top-2 left-1 w-10 text-right type-micro text-ink-subtle"
              >
                {formatHour(label.hour)}
              </Text>
              <View className="absolute right-0 left-13 top-0 h-px bg-line" />
            </View>
          ))}
        {layout.spine.map((segment, index) => (
          <Spine key={index} segment={segment} />
        ))}
        {layout.rows.map((row) => (
          <TimelineRow key={row.activity.id} row={row} onOpen={onOpen} onToggle={onToggle} />
        ))}
        {empty && (
          <View className="absolute top-10 right-6 left-28 items-start gap-2.5">
            <Text className="type-heading text-ink">A blank canvas</Text>
            <Text className="type-body-sm text-ink-muted">
              Nothing planned for this day yet. Tap any hour to drop something in, or start from a routine.
            </Text>
            <Chip tone={ChipTone.ACCENT} icon="plus" onPress={onPlanDay}>
              Plan this day
            </Chip>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
