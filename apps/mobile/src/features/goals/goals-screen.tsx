import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Chip, ChipTone } from '@/components/ui';
import { useGoals } from '@/data/goal-store';
import { TabScreen } from '@/features/navigation/tab-screen';

import { GoalCard } from './goal-card';

const DESCRIPTION = 'Long-term direction, broken into milestones.';

/** The Goals tab: one card per live goal in creation order, or the empty state with a New goal chip. */
export function GoalsScreen() {
  const goals = useGoals();

  if (goals.length === 0) {
    return (
      <TabScreen title="Goals" description={DESCRIPTION}>
        <View className="gap-4">
          <Text className="type-activity font-sans-semibold text-ink">No goals yet.</Text>
          <Chip
            tone={ChipTone.ACCENT}
            icon="plus"
            onPress={() => router.push('/goal/new')}
            accessibilityLabel="New goal"
          >
            New goal
          </Chip>
        </View>
      </TabScreen>
    );
  }

  return (
    <TabScreen title="Goals" description={DESCRIPTION}>
      <View className="gap-3">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </View>
    </TabScreen>
  );
}
