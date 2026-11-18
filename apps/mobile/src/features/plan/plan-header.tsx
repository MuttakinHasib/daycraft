import {
  addDays,
  datePartsOf,
  dateTitle,
  formatRelativeDate,
  formatShortDate,
  weekOf,
  type DailyProgress,
  type ISODate,
} from '@daycraft/domain';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ActivityHueBackground, Chip, ChipSize, ChipTone, Icon } from '@/components/ui';
import { useWeekDots } from '@/data/activity-store';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme/app-theme';

const TABULAR = { fontVariant: ['tabular-nums' as const] };
const RING_SIZE = 44;
const RING_RADIUS = 19;
const RING_STROKE = 4;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface PlanHeaderProps {
  date: ISODate;
  today: ISODate;
  progress: DailyProgress;
  onSelectDate: (date: ISODate) => void;
}

interface ProgressRingProps {
  progress: DailyProgress;
}

interface WeekStripProps {
  date: ISODate;
  today: ISODate;
  onSelectDate: (date: ISODate) => void;
}

/** The 44pt daily progress ring: the percent inside, a check at 100%, only the track at zero. */
function ProgressRing({ progress }: ProgressRingProps) {
  const colors = useThemeColors();
  const { percent, done, total } = progress;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${percent} percent, ${done} of ${total} done`}
      className="size-11 items-center justify-center"
    >
      <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} style={{ position: 'absolute' }}>
        <Circle cx={22} cy={22} r={RING_RADIUS} fill="none" stroke={colors['line-strong']} strokeWidth={RING_STROKE} />
        {percent > 0 && (
          <Circle
            cx={22}
            cy={22}
            r={RING_RADIUS}
            fill="none"
            stroke={colors.accent}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={`${(Math.min(percent, 100) / 100) * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
            transform="rotate(-90 22 22)"
          />
        )}
      </Svg>
      {percent >= 100 ? (
        <Icon name="check" size={18} strokeWidth={3} colorClassName="text-accent-text" />
      ) : (
        <Text style={TABULAR} className="text-sm font-sans-semibold tracking-tight text-ink">
          {percent}
        </Text>
      )}
    </View>
  );
}

/** Sunday to Saturday around the selected date, with hue dots; ‹ › move a week and keep the weekday. */
function WeekStrip({ date, today, onSelectDate }: WeekStripProps) {
  const week = weekOf(date);
  const dots = useWeekDots(week);
  return (
    <View className="mt-4 flex-row items-center">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Previous week"
        onPress={() => onSelectDate(addDays(date, -7))}
        className="h-15 w-5.5 items-center justify-center"
      >
        <Icon name="chev-l" size={16} colorClassName="text-ink-subtle" />
      </Pressable>
      {week.map((day, index) => {
        const selected = day === date;
        const isToday = day === today;
        return (
          <Pressable
            key={day}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${formatShortDate(day)}${isToday ? ', today' : ''}`}
            onPress={() => onSelectDate(day)}
            className="flex-1 items-center gap-1.25 py-0.5 active:opacity-70"
          >
            <Text className="text-xs font-sans-semibold text-ink-subtle">{WEEKDAY_SHORT[index]}</Text>
            <View className={cn('size-9 items-center justify-center rounded-full', { 'bg-accent': selected })}>
              <Text
                style={TABULAR}
                className={cn('text-base font-sans-semibold', {
                  'text-on-accent': selected,
                  'text-accent-text': !selected && isToday,
                  'text-ink': !selected && !isToday,
                })}
              >
                {datePartsOf(day).day}
              </Text>
            </View>
            <View className="h-2.5 flex-row items-center">
              {(dots[day] ?? []).map((hue) => (
                // A canvas halo around each dot keeps overlapping dots apart.
                <View key={hue} className="-ml-1.25 size-2.5 items-center justify-center rounded-full bg-canvas first:ml-0">
                  <View className={cn('size-1.75 rounded-full', ActivityHueBackground[hue])} />
                </View>
              ))}
            </View>
          </Pressable>
        );
      })}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next week"
        onPress={() => onSelectDate(addDays(date, 7))}
        className="h-15 w-5.5 items-center justify-center"
      >
        <Icon name="chev-r" size={16} colorClassName="text-ink-subtle" />
      </Pressable>
    </View>
  );
}

/** Plan's date title, Today chip, progress ring, subline and week strip (timeline guide §12). */
export function PlanHeader({ date, today, progress, onSelectDate }: PlanHeaderProps) {
  const title = dateTitle(date);
  const isToday = date === today;
  return (
    <View className="px-5 pt-6 pb-2">
      <View className="flex-row items-center justify-between gap-3">
        {/* The month picker (and the title's chevron that opens it) comes in a later slice. */}
        <Text accessibilityRole="header" numberOfLines={1} className="shrink type-date text-ink">
          {`${title.monthDay}, `}
          <Text className="text-accent-text">{title.year}</Text>
        </Text>
        <View className="flex-row items-center gap-2">
          {!isToday && (
            <Chip size={ChipSize.SM} tone={ChipTone.ACCENT_SOFT} onPress={() => onSelectDate(today)}>
              Today
            </Chip>
          )}
          <ProgressRing progress={progress} />
        </View>
      </View>
      <Text className="mt-1 type-body-sm font-sans-medium text-ink-muted">
        {`${title.weekday} · ${isToday ? 'Today' : formatRelativeDate(date, today)} · ${progress.done} of ${progress.total} done`}
      </Text>
      <WeekStrip date={date} today={today} onSelectDate={onSelectDate} />
    </View>
  );
}
