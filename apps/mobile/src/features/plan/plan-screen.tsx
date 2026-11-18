import {
  dateTitle,
  layoutDay,
  minutesOfDay,
  PHONE_SCALE,
  todayISO,
  type MinutesOfDay,
} from '@daycraft/domain';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { activityRepository, useDayActivities } from '@/data/activity-store';
import { useNow } from '@/lib/use-now';

import { Timeline } from './timeline';

// TODO(plan-timeline ticket 07): open the editor instead of this notice.
function comingSoon() {
  Alert.alert('New task', 'Coming soon.');
}

/** Plan: the selected date's header and its timeline. */
export function PlanScreen() {
  const clock = useNow();
  const today = todayISO(clock);
  const [date] = useState(today);
  const activities = useDayActivities(date);
  const isToday = date === today;
  const now = minutesOfDay(clock);
  const layout = layoutDay({ activities, scale: PHONE_SCALE, isToday, now });
  const title = dateTitle(date);

  return (
    <View className="flex-1 bg-canvas pt-safe">
      <View className="px-5 pt-6 pb-2">
        <Text accessibilityRole="header" className="type-date text-ink">
          {`${title.monthDay}, `}
          <Text className="text-accent-text">{title.year}</Text>
        </Text>
      </View>
      <View className="mt-2 flex-1 overflow-hidden rounded-t-sheet border-t border-line bg-surface">
        <View className="h-4.5 items-center justify-center">
          <View className="h-1 w-9 rounded-full bg-line-strong" />
        </View>
        <Timeline
          layout={layout}
          onOpen={() => undefined}
          onToggle={(id) => activityRepository.toggleDone(id)}
          onCreateAt={(_start: MinutesOfDay) => comingSoon()}
          onPlanDay={comingSoon}
        />
      </View>
    </View>
  );
}
