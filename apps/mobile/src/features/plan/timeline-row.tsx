import {
  formatGutterTime,
  formatRange,
  formatShortDuration,
  formatTimeText,
  RowState,
  type TimelineRow as Row,
} from '@daycraft/domain';
import { durations, radii, shadows } from '@daycraft/design-tokens';
import { Pressable, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { Capsule, CapsuleState, CheckRing, Icon, popIn, Tag, TagTone } from '@/components/ui';
import { cn } from '@/lib/cn';

import { DragMode, type TimelineDrag } from './use-timeline-drag';

// Rows glide to their new place over 220ms; Reanimated skips layout animations under Reduce Motion.
export const ROW_TRANSITION = LinearTransition.duration(durations.reflow);

const TABULAR = { fontVariant: ['tabular-nums' as const] };

// Movement under this many points is a tap, so scrolling and tapping still work (timeline guide §10).
const DRAG_THRESHOLD: [number, number] = [-6, 6];
const GRIP_HEIGHT = 18;

const CAPSULE_STATE: Record<RowState, CapsuleState> = {
  upcoming: CapsuleState.IDLE,
  active: CapsuleState.ACTIVE,
  done: CapsuleState.DONE,
};

interface TimelineRowProps {
  row: Row;
  /** Just created: the capsule pops in. */
  isNew: boolean;
  /** True while this row is being dragged: it lifts and stops animating. */
  dragging: boolean;
  drag: TimelineDrag;
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
}

/** One activity on the timeline: start label, capsule, text column and check ring (timeline guide §1, §6). */
export function TimelineRow({ row, isNew, dragging, drag, onOpen, onToggle }: TimelineRowProps) {
  const { activity, state } = row;
  const start = activity.start ?? 0;
  const done = state === RowState.DONE;
  const resizable = activity.durationMinutes >= 15;
  // A single time (no length, no meta line) centers its start label and text on the circle.
  const centered = activity.durationMinutes === 0 && !row.hasMeta;
  const doneSubtasks = activity.subtasks.filter((subtask) => subtask.done).length;
  const capsuleLabel = `${activity.title}, ${formatRange(start, activity.durationMinutes)}. Drag to move${
    resizable ? ', drag the bottom grip to resize' : ''
  }.`;

  const resize = usePanGesture({
    activeOffsetY: DRAG_THRESHOLD,
    enabled: resizable,
    runOnJS: true,
    onActivate: () => drag.begin(activity, DragMode.RESIZE),
    onUpdate: (event) => drag.update(event.translationY),
    onDeactivate: (event) => drag.end(event.canceled),
  });
  const move = usePanGesture({
    activeOffsetY: DRAG_THRESHOLD,
    runOnJS: true,
    requireToFail: resize,
    onActivate: () => drag.begin(activity, DragMode.MOVE),
    onUpdate: (event) => drag.update(event.translationY),
    onDeactivate: (event) => drag.end(event.canceled),
  });
  const open = () => {
    if (!drag.isPressSuppressed()) onOpen(activity.id);
  };

  return (
    <Animated.View
      layout={dragging ? undefined : ROW_TRANSITION}
      pointerEvents="box-none"
      style={{ top: row.top, height: row.rowHeight, zIndex: dragging ? 20 : 5 }}
      className="absolute inset-x-0"
    >
      {row.showStartLabel && (
        <Text
          style={TABULAR}
          className={cn('absolute left-1 w-10 text-right type-micro font-sans-semibold text-ink-muted', {
            'top-0.75': !centered,
            'top-4': centered,
          })}
        >
          {formatGutterTime(start)}
        </Text>
      )}
      {dragging && (
        <View className="absolute -top-7.5 left-28 h-6 justify-center rounded-full bg-ink px-2.5">
          <Text style={TABULAR} className="type-meta font-sans-semibold text-canvas">
            {formatRange(start, activity.durationMinutes)}
          </Text>
        </View>
      )}
      <GestureDetector gesture={move}>
        <Animated.View
          entering={isNew ? popIn : undefined}
          style={dragging ? { boxShadow: shadows.lift, borderRadius: radii.capsule.px } : undefined}
          className="absolute top-0 left-13"
        >
          <Capsule
            hue={activity.hue}
            state={CAPSULE_STATE[state]}
            height={row.capsuleHeight}
            elapsed={row.elapsed}
            grip={resizable}
            onPress={open}
            accessibilityLabel={capsuleLabel}
          >
            <Icon name={activity.icon} size={22} colorClassName="text-on-hue" />
          </Capsule>
        </Animated.View>
      </GestureDetector>
      {resizable && (
        // The grip's own touch area, over the capsule's bottom 18pt.
        <GestureDetector gesture={resize}>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{ top: row.capsuleHeight - GRIP_HEIGHT, height: GRIP_HEIGHT }}
            className="absolute left-13 w-12"
          />
        </GestureDetector>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${activity.title}`}
        onPress={open}
        className={cn('absolute top-0 right-14 left-28 items-start gap-px', {
          'pt-0.5': !centered,
          'bottom-0 justify-center': centered,
        })}
      >
        <View className="flex-row items-center gap-1.25">
          <Text numberOfLines={1} style={TABULAR} className="type-meta font-sans-medium text-ink-muted">
            {formatTimeText(start, activity.durationMinutes)}
          </Text>
          {activity.repeat !== 'never' && <Icon name="repeat" size={12} colorClassName="text-ink-muted" />}
          {activity.priority === 'high' && !done && <Icon name="flag" size={12} colorClassName="text-danger" />}
        </View>
        <Text
          numberOfLines={1}
          className={cn('max-w-full type-activity', {
            'text-ink': !done,
            'text-ink-subtle line-through': done,
          })}
        >
          {activity.title}
        </Text>
        {row.hasMeta && (
          <View className="mt-2 max-w-full flex-row items-center gap-1.5 overflow-hidden">
            {state === RowState.ACTIVE && (
              <Tag tone={TagTone.NOW}>{`Now · ${formatShortDuration(row.minutesLeft)} left`}</Tag>
            )}
            {activity.subtasks.length > 0 && (
              <Tag icon="checksq" trailingIcon="chev-r">{`${doneSubtasks}/${activity.subtasks.length}`}</Tag>
            )}
            {activity.kind === 'event' && <Tag icon="pin">{activity.location || 'Event'}</Tag>}
          </View>
        )}
      </Pressable>
      <View className="absolute top-3 right-5">
        <CheckRing
          checked={done}
          hue={activity.hue}
          onPress={() => onToggle(activity.id)}
          accessibilityLabel={`${done ? 'Mark not done' : 'Complete'}: ${activity.title}`}
        />
      </View>
    </Animated.View>
  );
}
