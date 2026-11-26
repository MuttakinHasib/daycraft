import { useLocalSearchParams } from 'expo-router';

import { habitRepository } from '@/data/habit-store';
import { HabitSheet } from '@/features/habits/habit-sheet';

/** The habit sheet: New habit from the tab's +, the empty state and Plan's + Habit circle; Edit habit with `id`. */
export default function HabitRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <HabitSheet habit={id ? (habitRepository.readHabit(id) ?? undefined) : undefined} />;
}
