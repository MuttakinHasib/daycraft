import { hueColors } from '@daycraft/design-tokens';
import {
  formatDuration,
  formatRange,
  formatRelativeDate,
  formatShortDate,
  todayISO,
  type Activity,
  type IconName,
} from '@daycraft/domain';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button, Icon, popIn, useToast } from '@/components/ui';
import { activityRepository, useActivity } from '@/data/activity-store';
import {
  BAND_TEXT,
  BandButton,
  BandTile,
  BandTileShape,
  HueBand,
  SheetFooter,
} from '@/features/activity-sheet/sheet-chrome';
import { cn } from '@/lib/cn';

const KIND_LABEL: Record<Activity['kind'], string> = { task: 'Task', event: 'Event', routine: 'Routine' };

interface ActivityDetailProps {
  id: string;
}

interface DetailRow {
  icon: IconName;
  label: string;
  value: string;
}

interface HeaderProps {
  activity: Activity;
  onToggle: () => void;
}

function capitalized(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function detailRows(activity: Activity, today: ReturnType<typeof todayISO>): DetailRow[] {
  const relative = formatRelativeDate(activity.date, today);
  const short = formatShortDate(activity.date);
  const rows: DetailRow[] = [
    { icon: 'calendar', label: 'Date', value: relative === short ? short : `${relative} · ${short}` },
    {
      icon: 'clock',
      label: 'Time',
      value: activity.start === null ? 'Anytime' : formatRange(activity.start, activity.durationMinutes),
    },
    {
      icon: 'timer',
      label: 'Duration',
      value: activity.durationMinutes ? formatDuration(activity.durationMinutes) : 'None',
    },
  ];
  if (activity.repeat !== 'never') rows.push({ icon: 'repeat', label: 'Repeats', value: capitalized(activity.repeat) });
  if (activity.priority !== 'none')
    rows.push({ icon: 'flag', label: 'Priority', value: capitalized(activity.priority) });
  if (activity.location) rows.push({ icon: 'pin', label: 'Location', value: activity.location });
  if (activity.labels.length) rows.push({ icon: 'tag', label: 'Labels', value: activity.labels.join(', ') });
  return rows;
}

function openEditor(id: string) {
  router.push({ pathname: '/activity/[id]/edit', params: { id } });
}

/** The header band: close, kind, edit, the icon tile, time, title and the check ring. */
function DetailHeader({ activity, onToggle }: HeaderProps) {
  return (
    <HueBand hue={activity.hue}>
      <View className="flex-row items-center justify-between">
        <BandButton icon="x" accessibilityLabel="Close" onPress={() => router.back()} />
        <View className="h-6 justify-center rounded-full bg-ink/12 px-2.5">
          <Text className={cn('type-meta font-sans-semibold', BAND_TEXT)}>{KIND_LABEL[activity.kind]}</Text>
        </View>
        <BandButton icon="edit" accessibilityLabel="Edit" onPress={() => openEditor(activity.id)} />
      </View>
      <View className="mt-4.5 flex-row items-center gap-3.5">
        <BandTile icon={activity.icon} shape={BandTileShape.CAPSULE} />
        <View className="min-w-0 flex-1">
          <Text
            style={{ fontVariant: ['tabular-nums'] }}
            className={cn('type-meta font-sans-semibold opacity-90', BAND_TEXT)}
          >
            {activity.start === null ? 'No set time' : formatRange(activity.start, activity.durationMinutes)}
          </Text>
          <Text className={cn('type-heading', BAND_TEXT, { 'line-through': activity.done })}>{activity.title}</Text>
        </View>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: activity.done }}
          accessibilityLabel={`${activity.done ? 'Mark not done' : 'Complete'}: ${activity.title}`}
          hitSlop={6}
          onPress={onToggle}
          className={cn('size-8 items-center justify-center rounded-full border-2 border-on-hue', {
            'bg-on-hue': activity.done,
          })}
        >
          {activity.done && (
            <Animated.View entering={popIn}>
              <Icon name="check" size={17} strokeWidth={3.2} colorClassName="text-ink" />
            </Animated.View>
          )}
        </Pressable>
      </View>
    </HueBand>
  );
}

/** The activity's detail sheet: everything about it, tickable subtasks, edit and delete (interaction patterns). */
export function ActivityDetail({ id }: ActivityDetailProps) {
  const activity = useActivity(id);
  const toast = useToast();
  if (!activity) return <View className="flex-1 bg-surface" />;

  const today = todayISO(new Date());
  const doneSubtasks = activity.subtasks.filter((subtask) => subtask.done).length;
  const toggle = () => {
    const toggled = activityRepository.toggleDone(activity.id);
    toast(toggled.done ? `Done · ${toggled.title}` : 'Marked as not done');
  };
  const remove = () => {
    activityRepository.remove(activity.id);
    router.back();
    toast(`Deleted · ${activity.title}`);
  };

  return (
    <View className="flex-1 bg-surface">
      <DetailHeader activity={activity} onToggle={toggle} />
      <View collapsable={false} className="flex-1">
        <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 py-4">
          <View className="overflow-hidden rounded-card bg-card">
            {detailRows(activity, today).map((row, index) => (
              <View
                key={row.label}
                className={cn('min-h-12 flex-row items-center gap-3 px-4', { 'border-t border-line': index > 0 })}
              >
                <Icon name={row.icon} size={18} colorClassName="text-ink-subtle" />
                <Text className="flex-1 type-body-sm text-ink-muted">{row.label}</Text>
                <Text
                  style={{ fontVariant: ['tabular-nums'] }}
                  className="shrink text-right type-body-sm font-sans-semibold text-ink"
                >
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
          {activity.subtasks.length > 0 && (
            <View className="overflow-hidden rounded-card bg-card">
              <View className="min-h-11 flex-row items-center justify-between px-4">
                <Text className="type-body-sm font-sans-semibold text-ink">Subtasks</Text>
                <Text className="type-meta text-ink-muted">{`${doneSubtasks} of ${activity.subtasks.length}`}</Text>
              </View>
              {activity.subtasks.map((subtask) => (
                <Pressable
                  key={subtask.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: subtask.done }}
                  accessibilityLabel={subtask.title}
                  onPress={() => activityRepository.toggleSubtask(subtask.id)}
                  className="min-h-12 flex-row items-center gap-3 border-t border-line px-4 active:bg-sunken"
                >
                  <View
                    style={{
                      borderColor: hueColors[activity.hue],
                      backgroundColor: subtask.done ? hueColors[activity.hue] : undefined,
                    }}
                    className="size-5 items-center justify-center rounded-check border-2"
                  >
                    {subtask.done && <Icon name="check" size={12} strokeWidth={3.2} colorClassName="text-on-hue" />}
                  </View>
                  <Text
                    className={cn('flex-1 type-body', {
                      'text-ink': !subtask.done,
                      'text-ink-muted line-through': subtask.done,
                    })}
                  >
                    {subtask.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          {activity.notes !== '' && (
            <Text className="rounded-card bg-card p-3.5 type-body-sm text-ink-muted">{activity.notes}</Text>
          )}
        </ScrollView>
      </View>
      <SheetFooter onDelete={remove}>
        {/* Start focus takes this place when Focus lands; until then the main action edits. */}
        <Button icon="edit" onPress={() => openEditor(activity.id)}>
          {`Edit ${KIND_LABEL[activity.kind].toLowerCase()}`}
        </Button>
      </SheetFooter>
    </View>
  );
}
