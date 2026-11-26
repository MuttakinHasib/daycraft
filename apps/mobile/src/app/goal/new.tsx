import { useLocalSearchParams } from 'expo-router';

import { goalRepository } from '@/data/goal-store';
import { GoalSheet } from '@/features/goals/goal-sheet';

/** The goal sheet: New goal from the Goals tab's + and its empty state; Edit goal with `id`. */
export default function GoalRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <GoalSheet goal={id ? (goalRepository.readGoal(id) ?? undefined) : undefined} />;
}
