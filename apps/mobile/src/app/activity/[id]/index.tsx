import { useLocalSearchParams } from 'expo-router';

import { ActivityDetail } from '@/features/activity-detail/activity-detail';

export default function ActivityDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ActivityDetail id={id} />;
}
