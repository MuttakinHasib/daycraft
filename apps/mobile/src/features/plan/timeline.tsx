import { hueColors } from '@daycraft/design-tokens';
import {
  formatClock,
  formatGutterTime,
  formatHour,
  formatShortDuration,
  SpineKind,
  type DayLayout,
  type FreeTimeHint,
  type MinutesOfDay,
  type SpineSegment,
  type Timing,
} from '@daycraft/domain';
import type { ComponentRef, Ref } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Chip, ChipTone, Icon } from '@/components/ui';
import { useThemeColors } from '@/theme/app-theme';

import { ROW_TRANSITION, TimelineRow } from './timeline-row';
import type { TimelineDrag } from './use-timeline-drag';

const DASH = 5;
const NOW_LINE_WIDTH = 1.5;

interface TimelineProps {
  layout: DayLayout;
  /** Minutes of day for the now line's gutter label. */
  now: MinutesOfDay;
  scrollRef?: Ref<ComponentRef<typeof ScrollView>>;
  /** The activity created a moment ago: its capsule pops in. */
  justCreatedId: string | null;
  drag: TimelineDrag;
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
  onCreateAt: (start: MinutesOfDay) => void;
  onPlanDay: () => void;
  onAddInGap: (timing: Timing) => void;
}

interface FreeTimeProps {
  hint: FreeTimeHint;
  onAdd: (timing: Timing) => void;
}

interface NowLineProps {
  y: number;
  now: MinutesOfDay;
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

/** Free time of an hour or more: its length, what comes next and an Add task chip (timeline guide §8). */
function FreeTime({ hint, onAdd }: FreeTimeProps) {
  const rest = hint.nowInside ? ` left, then ${hint.next.title}` : ` free before ${hint.next.title}`;
  return (
    <View pointerEvents="box-none" style={{ top: hint.top }} className="absolute right-5 left-28 items-start gap-2">
      <View className="flex-row items-center gap-1.5">
        <Icon name="clock" size={15} colorClassName="text-ink-muted" />
        <Text numberOfLines={1} className="shrink type-body-sm font-sans-medium text-ink-muted">
          <Text className="font-sans-semibold text-accent-text">{formatShortDuration(hint.minutes)}</Text>
          {rest}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Add a task at ${formatClock(hint.addStart)}`}
        hitSlop={6}
        onPress={() => onAdd({ start: hint.addStart, durationMinutes: hint.addDuration })}
        className="h-8 flex-row items-center gap-1.5 rounded-full bg-sunken pr-3 pl-1.5 active:opacity-85"
      >
        <View className="size-4.5 items-center justify-center rounded-full bg-accent">
          <Icon name="plus" size={12} strokeWidth={2.8} colorClassName="text-on-accent" />
        </View>
        <Text className="type-control text-accent-text">Add task</Text>
      </Pressable>
    </View>
  );
}

/** Today's current time: a line behind the rows, a dot on the spine and the time in the gutter (timeline guide §7). */
function NowLine({ y, now }: NowLineProps) {
  return (
    <View pointerEvents="none" style={{ top: y }} className="absolute inset-x-0 h-0">
      <Text
        style={{ fontVariant: ['tabular-nums'] }}
        className="absolute -top-2 left-1 w-10 text-right type-micro font-sans-semibold text-accent-text"
      >
        {formatGutterTime(now)}
      </Text>
      <View style={{ height: NOW_LINE_WIDTH }} className="absolute top-0 right-5 left-13 bg-accent opacity-50" />
      <View className="absolute -top-2 left-17 size-4 rounded-full border-3 border-surface bg-accent" />
    </View>
  );
}

/** The Plan timeline: renders `layoutDay`'s output and holds no layout logic of its own. */
export function Timeline({
  layout,
  now,
  scrollRef,
  justCreatedId,
  drag,
  onOpen,
  onToggle,
  onCreateAt,
  onPlanDay,
  onAddInGap,
}: TimelineProps) {
  const empty = layout.rows.length === 0;
  return (
    <ScrollView
      ref={scrollRef}
      scrollEnabled={drag.preview === null}
      className="flex-1"
      showsVerticalScrollIndicator={false}
    >
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
        {layout.nowY !== null && <NowLine y={layout.nowY} now={now} />}
        {layout.freeTime.map((hint) => (
          <FreeTime key={hint.next.id} hint={hint} onAdd={onAddInGap} />
        ))}
        {layout.rows.map((row) => (
          <TimelineRow
            key={row.activity.id}
            row={row}
            isNew={row.activity.id === justCreatedId}
            dragging={drag.preview?.id === row.activity.id}
            drag={drag}
            onOpen={onOpen}
            onToggle={onToggle}
          />
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
