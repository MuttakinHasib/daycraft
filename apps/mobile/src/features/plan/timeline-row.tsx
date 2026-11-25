import {
  formatGutterTime,
  formatRange,
  formatShortDuration,
  formatTimeText,
  RowState,
  type TimelineRow as Row,
} from '@daycraft/domain';
import { durations, radii, shadows } from '@daycraft/design-tokens';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { LinearTransition } from 'react-native-reanimated';

import {
  Capsule,
  CapsuleState,
  CheckRing,
  Icon,
  inkClassOn,
  popIn,
  Tag,
  TagTone,
  type CapsuleAccessibilityProps,
} from '@/components/ui';
import { cn } from '@/lib/cn';

import { DragMode, type DragNudge, type TimelineDrag } from './use-timeline-drag';

// Rows glide to their new place over 220ms; Reanimated skips layout animations under Reduce Motion.
export const ROW_TRANSITION = LinearTransition.duration(durations.reflow);

const TABULAR = { fontVariant: ['tabular-nums' as const] };

// Movement under this many points is a tap, so scrolling and tapping still work (timeline guide §10).
const DRAG_THRESHOLD: [number, number] = [-6, 6];
const GRIP_HEIGHT = 18;

// The drag as accessibility actions (timeline guide §14): moving and resizing in 15-minute steps.
type NudgeAction = NonNullable<CapsuleAccessibilityProps['accessibilityActions']>[number];
const NUDGE_MOVES: NudgeAction[] = [
  { name: 'moveEarlier', label: 'Move 15 minutes earlier' },
  { name: 'moveLater', label: 'Move 15 minutes later' },
];
const NUDGE_RESIZES: NudgeAction[] = [
  { name: 'shorten', label: 'Shorten by 15 minutes' },
  { name: 'extend', label: 'Extend by 15 minutes' },
];
const NUDGE_OF: Record<string, Omit<DragNudge, 'activity'>> = {
  moveEarlier: { mode: DragMode.MOVE, direction: -1 },
  moveLater: { mode: DragMode.MOVE, direction: 1 },
  shorten: { mode: DragMode.RESIZE, direction: -1 },
  extend: { mode: DragMode.RESIZE, direction: 1 },
};

/** The actions a row offers once it has the drag's: moving, and resizing where it has a resize grip. */
function nudgeActions(resizable: boolean): NudgeAction[] {
  return resizable ? [...NUDGE_MOVES, ...NUDGE_RESIZES] : NUDGE_MOVES;
}

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
  /** False where the row is only context, as the other activities are while onboarding places its task. */
  draggable?: boolean;
  /** Offers moving and resizing by 15 minutes as accessibility actions (onboarding's Place it; proposed for Plan). */
  dragActions?: boolean;
  /** Left out where the row can't be opened (onboarding). */
  onOpen?: (id: string) => void;
  /** Left out where the row has no check ring (onboarding). */
  onToggle?: (id: string) => void;
  /** Controls at the row's right edge in place of the check ring, such as onboarding's − / + on the day edges. */
  accessory?: ReactNode;
}

/** One activity on the timeline: start label, capsule, text column and check ring (timeline guide §1, §6). */
export function TimelineRow({
  row,
  isNew,
  dragging,
  drag,
  draggable = true,
  dragActions = false,
  onOpen,
  onToggle,
  accessory,
}: TimelineRowProps) {
  const { activity, state } = row;
  const start = activity.start ?? 0;
  const done = state === RowState.DONE;
  const resizable = activity.durationMinutes >= 15;
  // A single time (no length, no meta line) centers its start label and text on the circle.
  const centered = activity.durationMinutes === 0 && !row.hasMeta;
  const doneSubtasks = activity.subtasks.filter((subtask) => subtask.done).length;
  // A row that cannot be dragged here does not tell screen readers to drag it.
  const capsuleLabel = `${activity.title}, ${formatRange(start, activity.durationMinutes)}.${
    draggable ? ` Drag to move${resizable ? ', drag the bottom grip to resize' : ''}.` : ''
  }`;

  const resize = usePanGesture({
    activeOffsetY: DRAG_THRESHOLD,
    enabled: draggable && resizable,
    runOnJS: true,
    onActivate: () => drag.begin(activity, DragMode.RESIZE),
    onUpdate: (event) => drag.update(event.translationY),
    onDeactivate: (event) => drag.end(event.canceled),
  });
  const move = usePanGesture({
    activeOffsetY: DRAG_THRESHOLD,
    enabled: draggable,
    runOnJS: true,
    requireToFail: resize,
    onActivate: () => drag.begin(activity, DragMode.MOVE),
    onUpdate: (event) => drag.update(event.translationY),
    onDeactivate: (event) => drag.end(event.canceled),
  });
  const open = () => {
    if (!drag.isPressSuppressed()) onOpen?.(activity.id);
  };
  const onNudge: CapsuleAccessibilityProps['onAccessibilityAction'] = ({ nativeEvent: { actionName } }) => {
    const nudge = actionName ? NUDGE_OF[actionName] : undefined;
    if (nudge) drag.nudge({ activity, ...nudge });
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
            accessibilityActions={dragActions ? nudgeActions(resizable) : undefined}
            onAccessibilityAction={dragActions ? onNudge : undefined}
          >
            <Icon name={activity.icon} size={22} colorClassName={inkClassOn(activity.hue)} />
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
        accessibilityRole={onOpen ? 'button' : 'text'}
        disabled={!onOpen}
        accessibilityLabel={onOpen ? `Open ${activity.title}` : undefined}
        onPress={open}
        className={cn('absolute top-0 left-28 items-start gap-px', {
          'right-14': !accessory,
          'right-28': accessory,
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
      {accessory && <View className="absolute top-1 right-4 flex-row gap-1.5">{accessory}</View>}
      {onToggle && !accessory && (
        <View className="absolute top-3 right-5">
          <CheckRing
            checked={done}
            hue={activity.hue}
            onPress={() => onToggle(activity.id)}
            accessibilityLabel={`${done ? 'Mark not done' : 'Complete'}: ${activity.title}`}
          />
        </View>
      )}
    </Animated.View>
  );
}
