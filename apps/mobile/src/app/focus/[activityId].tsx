import { useLocalSearchParams } from 'expo-router';

import { FocusScreen } from '@/features/focus/focus-screen';

/** Focus on one activity, opened from a task's Start focus. */
export default function ActivityFocusRoute() {
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  return <FocusScreen activityId={activityId} />;
}
