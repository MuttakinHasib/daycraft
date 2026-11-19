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
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { ActivityHueBackground, Chip, ChipSize, ChipTone, Icon } from '@/components/ui';
import { useWeekDots } from '@/data/activity-store';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme/app-theme';

import { useHorizontalSwipe } from './use-horizontal-swipe';

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
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        style={{ position: 'absolute' }}
      >
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
        <Text style={TABULAR} className="type-control font-sans-semibold text-ink">
          {percent}
        </Text>
      )}
    </View>
  );
}

/** Sunday to Saturday around the selected date, with hue dots; ‹ › or a swipe move a week and keep the weekday. */
function WeekStrip({ date, today, onSelectDate }: WeekStripProps) {
  const week = weekOf(date);
  const dots = useWeekDots(week);
  const swipe = useHorizontalSwipe((step) => onSelectDate(addDays(date, 7 * step)));
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
      <GestureDetector gesture={swipe.gesture}>
        <Animated.View style={swipe.style} className="flex-1 flex-row">
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
                <Text className="type-meta font-sans-semibold text-ink-subtle">{WEEKDAY_SHORT[index]}</Text>
                <View className={cn('size-9 items-center justify-center rounded-full', { 'bg-accent': selected })}>
                  <Text
                    style={TABULAR}
                    className={cn('type-activity', {
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
                    <View
                      key={hue}
                      className="-ml-1.25 size-2.5 items-center justify-center rounded-full bg-canvas first:ml-0"
                    >
                      <View className={cn('size-1.75 rounded-full', ActivityHueBackground[hue])} />
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      </GestureDetector>
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${title.monthDay}, ${title.year}. Choose a date`}
          onPress={() => router.push('/month-picker')}
          className="shrink flex-row items-center gap-1.5 active:opacity-70"
        >
          <Text
            accessibilityRole="header"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            className="shrink type-date text-ink"
          >
            {`${title.monthDay}, `}
            <Text className="text-accent-text">{title.year}</Text>
          </Text>
          <Icon name="chev-r" size={20} strokeWidth={2.5} colorClassName="text-accent-text" />
        </Pressable>
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
