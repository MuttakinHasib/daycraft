import { dailyStreak, HabitFrequency, type Habit, type ISODate } from '@daycraft/domain';
import { Pressable, Text, View } from 'react-native';

import { ActivityHueBackground, ActivityHueText, colorValue, Icon, inkClassOn, strokeColor } from '@/components/ui';
import { toggleCheckIn, useCheckInDates } from '@/data/habit-store';
import { cn } from '@/lib/cn';

interface HabitCardProps {
  habit: Habit;
  checked: boolean;
  today: ISODate;
}

/** The Habits tab card: hue icon, name, "Every day · N-day streak" and the 44pt check button for today. */
export function HabitCard({ habit, checked, today }: HabitCardProps) {
  const checkIns = useCheckInDates(habit.id);
  const streak = dailyStreak(habit, checkIns, { today });
  const streakLine =
    streak === 0 ? 'Start a streak' : habit.frequency === HabitFrequency.WEEKLY ? `${streak}-week streak` : `${streak}-day streak`;
  const frequencyLine = habit.frequency === HabitFrequency.WEEKLY ? `${habit.target}× a week` : 'Every day';
  return (
    <View className="flex-row items-center gap-3 rounded-card bg-card p-4">
      <View
        style={{ backgroundColor: colorValue(habit.hue) }}
        className="size-10 items-center justify-center rounded-full"
      >
        <Icon name={habit.icon} size={18} colorClassName={inkClassOn(habit.hue)} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text numberOfLines={1} className="type-activity font-sans-semibold text-ink">
          {habit.name}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Text className="type-body-sm text-ink-muted">{frequencyLine}</Text>
          <Text className="type-body-sm text-ink-muted">·</Text>
          <Icon name="flame" size={14} colorClassName="text-amber" />
          <Text className="type-body-sm text-ink-muted">{streakLine}</Text>
        </View>
      </View>
      <HabitCheckButton habit={habit} checked={checked} today={today} />
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
