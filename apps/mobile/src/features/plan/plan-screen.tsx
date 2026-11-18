import { ScrollView, Text, View } from 'react-native';

import { todayISO } from '@daycraft/domain';

import { useDayActivities } from '@/data/activity-store';
import { useNow } from '@/lib/use-now';

function clock(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  return `${hours % 12 || 12}:${String(minutes % 60).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
}

/** Plan: the selected day's activities. */
export function PlanScreen() {
  const date = todayISO(useNow());
  const activities = useDayActivities(date);
  return (
    <ScrollView className="flex-1 bg-canvas" contentContainerClassName="gap-3 px-5 pt-safe-offset-6 pb-30">
      <Text accessibilityRole="header" className="type-display text-ink">
        Plan
      </Text>
      {activities.map((activity) => (
        <View key={activity.id} className="rounded-card bg-card px-4 py-3">
          <Text className="type-meta text-ink-muted">{activity.start === null ? 'Anytime' : clock(activity.start)}</Text>
          <Text className="type-activity text-ink">{activity.title}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
