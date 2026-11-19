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

import { ActivityHueBackground, Icon, IconButton, IconButtonSize, TextButton } from '@/components/ui';
import { useWeekDots } from '@/data/activity-store';
import { cn } from '@/lib/cn';

import { useHorizontalSwipe } from './use-horizontal-swipe';

const TABULAR = { fontVariant: ['tabular-nums' as const] };
const WEEKDAY_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);
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
  /** Shows a Today button that picks today. */
  onToday?: () => void;
  /** The selected day as an `ink` circle (the activity sheet's date) instead of `accent` (Plan). */
  inkSelection?: boolean;
}

interface DayGridProps {
  shown: CalendarMonth;
  selected: ISODate;
  today: ISODate;
  onPick: (date: ISODate) => void;
  inkSelection: boolean;
}

interface MonthGridProps {
  shown: CalendarMonth;
  selected: ISODate;
  today: ISODate;
  onPick: (month: number) => void;
}

/** The month's days in weeks, with hue dots; days of the neighbouring months are dimmed. */
function DayGrid({ shown, selected, today, onPick, inkSelection }: DayGridProps) {
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
                    'bg-accent': isSelected && !inkSelection,
                    'bg-ink': isSelected && inkSelection,
                  })}
                >
                  <Text
                    style={TABULAR}
                    className={cn('type-activity', {
                      'text-on-accent': isSelected && !inkSelection,
                      'text-canvas': isSelected && inkSelection,
                      'text-accent-text': !isSelected && isToday,
                      'text-ink': !isSelected && !isToday,
                    })}
                  >
                    {day}
                  </Text>
                </View>
                <View className="h-1.75 flex-row gap-0.75">
                  {(dots[date] ?? []).slice(0, MAX_DOTS).map((hue) => (
                    <View key={hue} className={cn('size-1.5 rounded-full', ActivityHueBackground[hue])} />
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

/** The twelve months of the shown year, to jump straight to one. */
function MonthGrid({ shown, selected, today, onPick }: MonthGridProps) {
  const current = monthOf(selected);
  const thisMonth = monthOf(today);
  return (
    <View className="flex-row flex-wrap gap-y-2 pt-2">
      {MONTHS.map((month) => {
        const isSelected = current.year === shown.year && current.month === month;
        const isThisMonth = thisMonth.year === shown.year && thisMonth.month === month;
        return (
          <Pressable
            key={month}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${monthName(month)} ${shown.year}`}
            onPress={() => onPick(month)}
            className="w-1/3 items-center active:opacity-70"
          >
            <View
              className={cn('h-11 w-24 items-center justify-center rounded-full', {
                'bg-accent': isSelected,
                'bg-sunken': !isSelected,
              })}
            >
              <Text
                className={cn('type-control font-sans-semibold', {
                  'text-on-accent': isSelected,
                  'text-accent-text': !isSelected && isThisMonth,
                  'text-ink': !isSelected && !isThisMonth,
                })}
              >
                {monthName(month, true)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * The month picker sheet (timeline guide §12): a month grid with hue dots. ‹ ›, or a swipe, change the month;
 * tapping the title switches to the year's months, where ‹ › change the year. Tapping a day picks it.
 */
export function MonthPicker({ selected, today, onPick, onClose, onToday, inkSelection = false }: MonthPickerProps) {
  const [shown, setShown] = useState(() => monthOf(selected));
  const [view, setView] = useState<PickerView>(PickerView.DAYS);
  const months = view === PickerView.MONTHS;
  const step = (direction: 1 | -1) => setShown((month) => addMonths(month, direction * (months ? 12 : 1)));
  const swipe = useHorizontalSwipe(step);
  const unit = months ? 'year' : 'month';

  return (
    <View className="bg-surface px-5 pt-6 pb-10">
      <View className="mb-4 flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            months ? `${shown.year}. Show days` : `${monthName(shown.month)} ${shown.year}. Choose a month`
          }
          onPress={() => setView(months ? PickerView.DAYS : PickerView.MONTHS)}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Text className="type-heading text-ink">
            {months ? '' : `${monthName(shown.month)} `}
            <Text className="text-accent-text">{shown.year}</Text>
          </Text>
          <Icon name={months ? 'chev-d' : 'chev-r'} size={18} strokeWidth={2.5} colorClassName="text-accent-text" />
        </Pressable>
        <View className="flex-1" />
        {/* With Today, the days view swaps ‹ › for it; swipes and the title's months still change the month. */}
        {onToday && !months ? (
          <TextButton label="Today" onPress={onToday} />
        ) : (
          <>
            <IconButton icon="chev-l" accessibilityLabel={`Previous ${unit}`} onPress={() => step(-1)} />
            <IconButton icon="chev-r" accessibilityLabel={`Next ${unit}`} onPress={() => step(1)} />
          </>
        )}
        <View className="w-1" />
        <IconButton icon="x" size={IconButtonSize.LG} accessibilityLabel="Close" onPress={onClose} />
      </View>
      <GestureDetector gesture={swipe.gesture}>
        <Animated.View style={swipe.style}>
          {months ? (
            <MonthGrid
              shown={shown}
              selected={selected}
              today={today}
              onPick={(month) => {
                setShown({ year: shown.year, month });
                setView(PickerView.DAYS);
              }}
            />
          ) : (
            <DayGrid shown={shown} selected={selected} today={today} onPick={onPick} inkSelection={inkSelection} />
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
