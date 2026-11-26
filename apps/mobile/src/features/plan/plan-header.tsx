import {
  addDays,
  datePartsOf,
  dateTitle,
  daysBetween,
  formatRelativeDate,
  formatShortDate,
  weekOf,
  type DailyProgress,
  type ISODate,
} from '@daycraft/domain';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colorValue, Icon, TextButton } from '@/components/ui';
import { useWeekDots } from '@/data/activity-store';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme/app-theme';

const TABULAR = { fontVariant: ['tabular-nums' as const] };
const RING_SIZE = 44;
const RING_RADIUS = 19;
const RING_STROKE = 4;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// The strip pages through ten years of weeks either side of today's.
const PAGE_SPAN = 520;
const PAGES = Array.from({ length: PAGE_SPAN * 2 + 1 }, (_, index) => index);

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

interface WeekPageProps {
  week: ISODate[];
  date: ISODate;
  today: ISODate;
  width: number;
  onSelectDate: (date: ISODate) => void;
}

/** One page of the strip: a Sunday-to-Saturday week with hue dots. */
function WeekPage({ week, date, today, width, onSelectDate }: WeekPageProps) {
  const dots = useWeekDots(week);
  return (
    <View style={{ width }} className="flex-row">
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
                  <View style={{ backgroundColor: colorValue(hue) }} className="size-1.75 rounded-full" />
                </View>
              ))}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Sunday to Saturday around the selected date, with hue dots. The weeks are pages of a native paged list, so a
 * swipe drags the next week in under the finger; ‹ › page the same way. Both keep the weekday.
 */
function WeekStrip({ date, today, onSelectDate }: WeekStripProps) {
  // Pages are counted from the week of `today` at mount, PAGE_SPAN weeks either way.
  const [anchor] = useState(() => weekOf(today)[0] ?? today);
  const [width, setWidth] = useState(0);
  const listRef = useRef<FlatList<number>>(null);
  const pageOf = (day: ISODate) => PAGE_SPAN + Math.floor(daysBetween(anchor, day) / 7);
  const page = pageOf(date);
  const weekdayOffset = daysBetween(weekOf(date)[0] ?? date, date);

  // Follow a date picked elsewhere (arrows, a day, the month picker, Today).
  useEffect(() => {
    if (width > 0) listRef.current?.scrollToOffset({ offset: page * width, animated: true });
  }, [page, width]);

  const settle = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const landed = Math.round(event.nativeEvent.contentOffset.x / width);
    if (landed !== page) onSelectDate(addDays(date, (landed - page) * 7));
  };

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
      <View className="flex-1 overflow-hidden" onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 && (
          <FlatList
            ref={listRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={PAGES}
            keyExtractor={String}
            initialScrollIndex={page}
            contentOffset={{ x: page * width, y: 0 }}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            initialNumToRender={1}
            windowSize={3}
            maxToRenderPerBatch={2}
            onMomentumScrollEnd={settle}
            renderItem={({ item }) => {
              const sunday = addDays(anchor, (item - PAGE_SPAN) * 7);
              return (
                <WeekPage
                  week={weekOf(sunday)}
                  date={item === page ? date : addDays(sunday, weekdayOffset)}
                  today={today}
                  width={width}
                  onSelectDate={onSelectDate}
                />
              );
            }}
            extraData={`${date}|${today}`}
          />
        )}
      </View>
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
    <View className="px-5 pt-2 pb-2">
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
          {!isToday && <TextButton label="Today" onPress={() => onSelectDate(today)} />}
          <ProgressRing progress={progress} />
        </View>
      </View>
      {/* Today says the weekday; another day lets the relative date carry it, so the weekday is not said twice. */}
      <Text className="mt-1 type-body-sm font-sans-medium text-ink-muted">
        {`${isToday ? `${title.weekday} · Today` : formatRelativeDate(date, today)} · ${progress.done} of ${progress.total} done`}
      </Text>
      <WeekStrip date={date} today={today} onSelectDate={onSelectDate} />
    </View>
  );
}
