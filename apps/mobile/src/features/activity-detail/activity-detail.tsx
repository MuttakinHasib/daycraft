import { hueColors, sheetHeaderTint, withOpacity } from '@daycraft/design-tokens';
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
import { cn } from '@/lib/cn';
import { useColorScheme, useThemeColors } from '@/theme/app-theme';

// Light: the hue at 40% over the canvas with ink text. Dark: the solid hue with on-hue text.
const HEADER_TEXT = 'text-ink dark:text-on-hue';

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
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const hue = hueColors[activity.hue];
  const scrim = withOpacity(colors.ink, 0.08);
  return (
    <View collapsable={false} className="bg-canvas">
      <View style={{ backgroundColor: withOpacity(hue, sheetHeaderTint[scheme]) }} className="px-5 pt-4 pb-6">
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => router.back()}
            style={{ backgroundColor: scrim }}
            className="size-10 items-center justify-center rounded-full active:opacity-70"
          >
            <Icon name="x" size={18} colorClassName={HEADER_TEXT} />
          </Pressable>
          <View
            style={{ backgroundColor: withOpacity(colors.ink, 0.12) }}
            className="h-6 justify-center rounded-full px-2.5"
          >
            <Text className={cn('text-xs font-sans-semibold', HEADER_TEXT)}>{KIND_LABEL[activity.kind]}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit"
            onPress={() => openEditor(activity.id)}
            style={{ backgroundColor: scrim }}
            className="size-10 items-center justify-center rounded-full active:opacity-70"
          >
            <Icon name="edit" size={17} colorClassName={HEADER_TEXT} />
          </Pressable>
        </View>
        <View className="mt-4.5 flex-row items-center gap-3.5">
          <View
            style={{ backgroundColor: scrim, borderColor: withOpacity(colors['on-hue'], 0.55) }}
            className="h-18 w-14 items-center justify-center rounded-capsule border-2"
          >
            <Icon name={activity.icon} size={25} colorClassName={HEADER_TEXT} />
          </View>
          <View className="min-w-0 flex-1">
            <Text
              style={{ fontVariant: ['tabular-nums'] }}
              className={cn('type-meta font-sans-semibold opacity-90', HEADER_TEXT)}
            >
              {activity.start === null ? 'No set time' : formatRange(activity.start, activity.durationMinutes)}
            </Text>
            <Text className={cn('type-heading', HEADER_TEXT, { 'line-through': activity.done })}>{activity.title}</Text>
          </View>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: activity.done }}
            accessibilityLabel={`${activity.done ? 'Mark not done' : 'Complete'}: ${activity.title}`}
            hitSlop={6}
            onPress={onToggle}
            style={{ borderColor: colors['on-hue'] }}
            className={cn('size-8 items-center justify-center rounded-full border-2', { 'bg-on-hue': activity.done })}
          >
            {activity.done && (
              <Animated.View entering={popIn}>
                <Icon name="check" size={17} strokeWidth={3.2} colorClassName="text-ink" />
              </Animated.View>
            )}
          </Pressable>
        </View>
      </View>
    </View>
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
      <View collapsable={false} className="flex-row gap-2.5 border-t border-line px-5 pt-3 pb-safe-offset-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete"
          onPress={remove}
          className="size-13 items-center justify-center rounded-full bg-sunken active:opacity-70"
        >
          <Icon name="trash" size={19} colorClassName="text-danger" />
        </Pressable>
        {/* Start focus joins this footer when Focus lands; until then the main action edits. */}
        <View className="flex-1">
          <Button icon="edit" onPress={() => openEditor(activity.id)}>
            {`Edit ${KIND_LABEL[activity.kind].toLowerCase()}`}
          </Button>
        </View>
      </View>
    </View>
  );
}
