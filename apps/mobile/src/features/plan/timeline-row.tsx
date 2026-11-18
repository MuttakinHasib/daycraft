import {
  formatGutterTime,
  formatRange,
  formatShortDuration,
  formatTimeText,
  RowState,
  type TimelineRow as Row,
} from '@daycraft/domain';
import { Pressable, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { Capsule, CapsuleState, CheckRing, Icon, popIn, Tag, TagTone } from '@/components/ui';
import { cn } from '@/lib/cn';

// Rows glide to their new place over 220ms; Reanimated skips layout animations under Reduce Motion.
export const ROW_TRANSITION = LinearTransition.duration(220);

const TABULAR = { fontVariant: ['tabular-nums' as const] };

const CAPSULE_STATE: Record<RowState, CapsuleState> = {
  upcoming: CapsuleState.IDLE,
  active: CapsuleState.ACTIVE,
  done: CapsuleState.DONE,
};

interface TimelineRowProps {
  row: Row;
  /** Just created: the capsule pops in. */
  isNew: boolean;
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
}

/** One activity on the timeline: start label, capsule, text column and check ring (timeline guide §1, §6). */
export function TimelineRow({ row, isNew, onOpen, onToggle }: TimelineRowProps) {
  const { activity, state } = row;
  const start = activity.start ?? 0;
  const done = state === RowState.DONE;
  const resizable = activity.durationMinutes >= 15;
  const doneSubtasks = activity.subtasks.filter((subtask) => subtask.done).length;
  const capsuleLabel = `${activity.title}, ${formatRange(start, activity.durationMinutes)}. Drag to move${
    resizable ? ', drag the bottom grip to resize' : ''
  }.`;

  return (
    <Animated.View
      layout={ROW_TRANSITION}
      pointerEvents="box-none"
      style={{ top: row.top, height: row.rowHeight }}
      className="absolute inset-x-0"
    >
      {row.showStartLabel && (
        <Text
          style={TABULAR}
          className="absolute top-0.75 left-1 w-10 text-right type-micro font-sans-semibold text-ink-muted"
        >
          {formatGutterTime(start)}
        </Text>
      )}
      <Animated.View entering={isNew ? popIn : undefined} className="absolute top-0 left-13">
        <Capsule
          hue={activity.hue}
          state={CAPSULE_STATE[state]}
          height={row.capsuleHeight}
          elapsed={row.elapsed}
          grip={resizable}
          onPress={() => onOpen(activity.id)}
          accessibilityLabel={capsuleLabel}
        >
          <Icon name={activity.icon} size={22} colorClassName="text-on-hue" />
        </Capsule>
      </Animated.View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${activity.title}`}
        onPress={() => onOpen(activity.id)}
        className="absolute top-0 right-14 left-28 items-start gap-px pt-0.5"
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
