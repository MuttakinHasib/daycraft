import { todayISO } from '@daycraft/domain';
import { router } from 'expo-router';
import { View } from 'react-native';

import { Chip, ChipTone } from '@/components/ui';
import { useCheckedHabitIds, useHabits } from '@/data/habit-store';
import { TabScreen } from '@/features/navigation/tab-screen';
import { useNow } from '@/lib/use-now';

import { HabitCard } from './habit-card';

const EMPTY_DESCRIPTION = 'Daily and weekly habits, with streaks.';

/** The Habits tab: the summary line and one card per habit, or the empty state with a New habit chip. */
export function HabitsScreen() {
  const habits = useHabits();
  const clock = useNow();
  const today = todayISO(clock);
  const checkedIds = useCheckedHabitIds(today);
  const checked = checkedIds.length;

  if (habits.length === 0) {
    return (
      <TabScreen title="Habits" description={EMPTY_DESCRIPTION}>
        <Chip
          tone={ChipTone.ACCENT}
          icon="plus"
          onPress={() => router.push('/habit/new')}
          accessibilityLabel="New habit"
        >
          New habit
        </Chip>
      </TabScreen>
    );
  }

  const allDone = checked === habits.length;
  const description = `${checked} of ${habits.length} checked in today.${allDone ? ' A perfect day.' : ''}`;
  return (
    <TabScreen title="Habits" description={description}>
      <View className="gap-3">
        {habits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} checked={checkedIds.includes(habit.id)} today={today} />
        ))}
      </View>
    </TabScreen>
  );
}
