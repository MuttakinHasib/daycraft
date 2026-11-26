import {
  addDays,
  completionPercent,
  dailyStreak,
  HabitFrequency,
  weekdayOf,
  weeklyCount,
  weeklyStreak,
  windowStartOf,
  type Habit,
  type ISODate,
} from '@daycraft/domain';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ActivityHueBackground, ActivityHueText, colorValue, Icon, inkClassOn, strokeColor } from '@/components/ui';
import { toggleCheckIn, useCheckInDates } from '@/data/habit-store';
import { cn } from '@/lib/cn';

// The Habits tab card (navigation-and-modules): hue icon, name, frequency and streak, the 44pt check button
// for today, the last 7 days as bars ending today, "This week · N of Target" for a weekly habit, and, when
// the name is tapped, the 5-week heatmap with its completion %. Only today's button checks in.

interface HabitCardProps {
  habit: Habit;
  checked: boolean;
  today: ISODate;
}

export function HabitCard({ habit, checked, today }: HabitCardProps) {
  const checkIns = useCheckInDates(habit.id);
  const [open, setOpen] = useState(false);
  const weekly = habit.frequency === HabitFrequency.WEEKLY;
  const streak = weekly ? weeklyStreak(habit, checkIns, { today }) : dailyStreak(habit, checkIns, { today });
  const streakLine = streak === 0 ? 'Start a streak' : `${streak}-${weekly ? 'week' : 'day'} streak`;
  const frequencyLine = weekly ? `${habit.target}× a week` : 'Every day';
  return (
    <View className="gap-3 rounded-card bg-card p-4">
      <View className="flex-row items-center gap-3">
        <View
          style={{ backgroundColor: colorValue(habit.hue) }}
          className="size-10 items-center justify-center rounded-full"
        >
          <Icon name={habit.icon} size={18} colorClassName={inkClassOn(habit.hue)} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={open ? `Hide history: ${habit.name}` : `Show history: ${habit.name}`}
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen((current) => !current)}
          className="flex-1 gap-0.5 active:opacity-70"
        >
          <Text numberOfLines={1} className="type-activity font-sans-semibold text-ink">
            {habit.name}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Text className="type-body-sm text-ink-muted">{frequencyLine}</Text>
            <Text className="type-body-sm text-ink-muted">·</Text>
            <Icon name="flame" size={14} colorClassName="text-amber" />
            <Text className="type-body-sm text-ink-muted">{streakLine}</Text>
          </View>
        </Pressable>
        <HabitCheckButton habit={habit} checked={checked} today={today} />
      </View>
      <WeekBars habit={habit} today={today} />
      {weekly && habit.target !== null && (
        <View className="flex-row justify-between">
          <Text className="type-meta text-ink-muted">This week</Text>
          <Text className="type-meta font-sans-semibold text-ink">
            {weeklyCount(habit, checkIns, { today })} of {habit.target}
          </Text>
        </View>
      )}
      {open && <HabitHistory habit={habit} today={today} />}
    </View>
  );
}

/** The last 7 days ending today as bars in the hue, with the weekday letter under each. */
function WeekBars({ habit, today }: { habit: Habit; today: ISODate }) {
  const checkIns = new Set(useCheckInDates(habit.id));
  return (
    <View className="flex-row gap-1">
      {Array.from({ length: 7 }, (_, index) => {
        const date = addDays(today, index - 6);
        const checkedDay = checkIns.has(date);
        const isToday = date === today;
        return (
          <View key={date} className="flex-1 items-center gap-1">
            <View
              className={cn('h-2 w-full rounded-full', {
                [ActivityHueBackground[habit.hue]]: checkedDay,
                'bg-sunken': !checkedDay,
              })}
            />
            <Text
              className={cn('type-micro font-sans-semibold', {
                'text-ink': isToday,
                'text-ink-subtle': !isToday,
              })}
            >
              {WEEKDAY_LETTERS[weekdayOf(date)]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// One letter per weekday, Sunday first (the reference's W T F S S M T row).
const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** The expanded history: "Last 5 weeks" with the completion %, over the heatmap of those weeks. */
function HabitHistory({ habit, today }: { habit: Habit; today: ISODate }) {
  const checkIns = new Set(useCheckInDates(habit.id));
  const percent = completionPercent(habit, Array.from(checkIns), { today });
  const start = windowStartOf({ today });
  return (
    <View className="gap-3 border-t border-line pt-3">
      <View className="flex-row justify-between">
        <Text className="type-meta text-ink-muted">Last 5 weeks</Text>
        <Text className="type-meta font-sans-semibold text-ink">{percent}% completion</Text>
      </View>
      <View className="gap-1">
        {Array.from({ length: 5 }, (_, week) => (
          <View key={week} className="flex-row gap-1">
            {Array.from({ length: 7 }, (_, day) => {
              const date = addDays(start, week * 7 + day);
              const future = date > today;
              const checkedDay = checkIns.has(date);
              return (
                <View
                  key={date}
                  className={cn('h-6 flex-1 rounded-check', {
                    [ActivityHueBackground[habit.hue]]: checkedDay,
                    'bg-sunken': !checkedDay && !future,
                  })}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

interface HabitCheckButtonProps {
  habit: Habit;
  checked: boolean;
  today: ISODate;
}

/** Today's check button: outlined in the hue, filled when checked in. The Habits tab checks in today only. */
function HabitCheckButton({ habit, checked, today }: HabitCheckButtonProps) {
  const toggle = () => {
    toggleCheckIn(habit.id, today);
  };
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={checked ? `Mark not done: ${habit.name}` : `Check in: ${habit.name}`}
      onPress={toggle}
      style={checked ? { backgroundColor: colorValue(habit.hue) } : { borderColor: strokeColor(habit.hue) }}
      className={cn('size-11 items-center justify-center rounded-full active:opacity-80', {
        'border-2': !checked,
        [ActivityHueBackground[habit.hue]]: checked,
      })}
    >
      <Icon
        name="check"
        size={20}
        strokeWidth={2.6}
        colorClassName={checked ? inkClassOn(habit.hue) : ActivityHueText[habit.hue]}
      />
    </Pressable>
  );
}
