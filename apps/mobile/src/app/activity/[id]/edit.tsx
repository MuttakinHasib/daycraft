import { todayISO, type ActivityInput } from '@daycraft/domain';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { activityRepository } from '@/data/activity-store';
import { ActivityEditor } from '@/features/activity-editor/activity-editor';

export default function EditActivityRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [setup] = useState(() => {
    const activity = activityRepository.readActivity(id);
    if (!activity) return null;
    const { id: _id, ...fields } = activity;
    const initial: ActivityInput = fields;
    return { initial, today: todayISO(new Date()) };
  });
  if (!setup) return <View className="flex-1 bg-surface" />;
  return <ActivityEditor initial={setup.initial} activityId={id} today={setup.today} />;
}
