import {
  addMonths,
  datePartsOf,
  monthGrid,
  monthName,
  monthOf,
  type CalendarMonth,
  type ISODate,
} from '@daycraft/domain';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { ButtonGroup, colorValue, Icon, Wheel, type WheelOption } from '@/components/ui';
import { useWeekDots } from '@/data/activity-store';
import { cn } from '@/lib/cn';

import { useHorizontalSwipe } from './use-horizontal-swipe';

const TABULAR = { fontVariant: ['tabular-nums' as const] };
const WEEKDAY_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_OPTIONS: WheelOption[] = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: monthName(index + 1),
}));
// The month and year wheel reaches this many years either side of today.
const YEAR_SPAN = 10;
const MAX_DOTS = 3;

const PickerView = {
  DAYS: 'days',
  MONTHS: 'months',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
type PickerView = (typeof PickerView)[keyof typeof PickerView];

interface MonthPickerProps {
  selected: ISODate;
  today: ISODate;
  onPick: (date: ISODate) => void;
  onClose: () => void;
  /** Picks today; in the days view it takes the place of ‹ ›. */
  onToday: () => void;
}

interface DayGridProps {
  shown: CalendarMonth;
  selected: ISODate;
  today: ISODate;
  onPick: (date: ISODate) => void;
}

interface MonthYearWheelProps {
  shown: CalendarMonth;
  today: ISODate;
  onChange: (month: CalendarMonth) => void;
}

/** The month's days in weeks, with hue dots; days of the neighbouring months are dimmed. */
function DayGrid({ shown, selected, today, onPick }: DayGridProps) {
  const dates = monthGrid(shown);
  const dots = useWeekDots(dates);
  const weeks = Array.from({ length: dates.length / 7 }, (_, week) => dates.slice(week * 7, week * 7 + 7));
  return (
    <View>
      <View className="flex-row">
        {WEEKDAY_SHORT.map((weekday) => (
          <Text key={weekday} className="flex-1 text-center type-meta font-sans-medium text-ink-subtle">
            {weekday}
          </Text>
        ))}
      </View>
      {weeks.map((week) => (
        <View key={week[0]} className="flex-row">
          {week.map((date) => {
            const { month, day } = datePartsOf(date);
            const inMonth = month === shown.month;
            const isSelected = date === selected;
            const isToday = date === today;
            return (
              <Pressable
                key={date}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${monthName(month)} ${day}${isToday ? ', today' : ''}`}
                onPress={() => onPick(date)}
                className={cn('h-13 flex-1 items-center gap-0.5 pt-1 active:opacity-70', { 'opacity-40': !inMonth })}
              >
                <View
                  className={cn('size-9 items-center justify-center rounded-full', {
                    'bg-accent': isSelected,
                  })}
                >
                  <Text
                    style={TABULAR}
                    className={cn('type-activity', {
                      'text-on-accent': isSelected,
                      'text-accent-text': !isSelected && isToday,
                      'text-ink': !isSelected && !isToday,
                    })}
                  >
                    {day}
                  </Text>
                </View>
                <View className="h-1.75 flex-row gap-0.75">
                  {(dots[date] ?? []).slice(0, MAX_DOTS).map((hue) => (
                    <View key={hue} style={{ backgroundColor: colorValue(hue) }} className="size-1.5 rounded-full" />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

/** A native month and year wheel, ten years either side of today; turning it moves the calendar there. */
function MonthYearWheel({ shown, today, onChange }: MonthYearWheelProps) {
  const thisYear = monthOf(today).year;
  const years: WheelOption[] = Array.from({ length: YEAR_SPAN * 2 + 1 }, (_, index) => {
    const year = thisYear - YEAR_SPAN + index;
    return { value: year, label: String(year) };
  });
  return (
    <Wheel
      accessibilityLabel="Month and year"
      columns={[
        {
          key: 'month',
          label: 'Month',
          options: MONTH_OPTIONS,
          value: shown.month,
          onChange: (month) => onChange({ year: shown.year, month }),
        },
        {
          key: 'year',
          label: 'Year',
          options: years,
          value: shown.year,
          onChange: (year) => onChange({ year, month: shown.month }),
        },
      ]}
    />
  );
}

/**
 * The month picker sheet (timeline guide §12): a month grid with hue dots; a swipe changes the month. Tapping the
 * title switches to a native month and year wheel (⌄), and tapping it again goes back to the days. Tapping a day
 * picks it; Today picks today.
 */
export function MonthPicker({ selected, today, onPick, onClose, onToday }: MonthPickerProps) {
  const [shown, setShown] = useState(() => monthOf(selected));
  const [view, setView] = useState<PickerView>(PickerView.DAYS);
  const months = view === PickerView.MONTHS;
  const swipe = useHorizontalSwipe((direction) => setShown((month) => addMonths(month, direction)));

  return (
    <View className="bg-surface px-5 pt-6 pb-2">
      <View className="mb-4 flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            months
              ? `${monthName(shown.month)} ${shown.year}. Show days`
              : `${monthName(shown.month)} ${shown.year}. Choose a month and year`
          }
          onPress={() => setView(months ? PickerView.DAYS : PickerView.MONTHS)}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Text className="type-heading text-ink">
            {`${monthName(shown.month)} `}
            <Text className="text-accent-text">{shown.year}</Text>
          </Text>
          <Icon name={months ? 'chev-d' : 'chev-r'} size={18} strokeWidth={2.5} colorClassName="text-accent-text" />
        </Pressable>
        <View className="flex-1" />
        <ButtonGroup
          buttons={[
            { label: 'Today', onPress: onToday },
            { icon: 'x', accessibilityLabel: 'Close', onPress: onClose },
          ]}
        />
      </View>
      <GestureDetector gesture={swipe.gesture}>
        <Animated.View style={swipe.style}>
          {months ? (
            <MonthYearWheel shown={shown} today={today} onChange={setShown} />
          ) : (
            <DayGrid shown={shown} selected={selected} today={today} onPick={onPick} />
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
