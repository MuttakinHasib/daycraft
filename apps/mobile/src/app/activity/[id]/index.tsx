import { useLocalSearchParams } from 'expo-router';

import { ActivityDetail } from '@/features/activity-detail/activity-detail';

/** The detail sheet for one activity. */
export default function ActivityDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ActivityDetail id={id} />;
}
