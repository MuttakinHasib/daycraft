import { todayISO, type ActivityInput } from '@daycraft/domain';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { activityRepository } from '@/data/activity-store';
import { ActivitySheet } from '@/features/activity-sheet/activity-sheet';

/** The activity sheet for an existing task or event, open and ready to edit. */
export default function ActivityRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [setup] = useState(() => {
    const activity = activityRepository.readActivity(id);
    if (!activity) return null;
    const { id: _id, ...fields } = activity;
    const initial: ActivityInput = fields;
    return { initial, today: todayISO(new Date()) };
  });
  if (!setup) return <View className="flex-1 bg-surface" />;
  return <ActivitySheet initial={setup.initial} activityId={id} today={setup.today} />;
}
