import { dailyProgress, layoutDay, minutesOfDay, PHONE_SCALE, todayISO, type DayLayout } from '@daycraft/domain';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { activityRepository, useDayActivities } from '@/data/activity-store';
import { useNow } from '@/lib/use-now';

import { PlanHeader } from './plan-header';
import { Timeline } from './timeline';

// Where Plan lands (timeline guide §11): the now line 170pt from the top on today, else the first activity 10pt from it.
const NOW_OFFSET = 170;
const FIRST_ROW_OFFSET = 10;

// TODO(plan-timeline ticket 07): open the editor instead of this notice.
function comingSoon() {
  Alert.alert('New task', 'Coming soon.');
}

function landingY(layout: DayLayout): number {
  if (layout.nowY !== null) return Math.max(0, layout.nowY - NOW_OFFSET);
  const first = layout.rows[0];
  return first ? Math.max(0, first.top - FIRST_ROW_OFFSET) : 0;
}

/** Plan: the selected date's header and its timeline. */
export function PlanScreen() {
  const clock = useNow();
  const today = todayISO(clock);
  const [date, setDate] = useState(today);
  const activities = useDayActivities(date);
  const now = minutesOfDay(clock);
  const layout = layoutDay({ activities, scale: PHONE_SCALE, isToday: date === today, now });
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  // Read by the scroll effects below without making every layout change scroll the timeline.
  const layoutRef = useRef(layout);
  useEffect(() => {
    layoutRef.current = layout;
  });
  const scrollToLanding = useCallback(() => {
    scrollRef.current?.scrollTo({ y: landingY(layoutRef.current), animated: false });
  }, []);

  useEffect(scrollToLanding, [date, scrollToLanding]);
  useFocusEffect(scrollToLanding);

  return (
    <View className="flex-1 bg-canvas pt-safe">
      <PlanHeader date={date} today={today} progress={dailyProgress(activities)} onSelectDate={setDate} />
      <View className="mt-2 flex-1 overflow-hidden rounded-t-sheet border-t border-line bg-surface">
        <View className="h-4.5 items-center justify-center">
          <View className="h-1 w-9 rounded-full bg-line-strong" />
        </View>
        <Timeline
          layout={layout}
          now={now}
          scrollRef={scrollRef}
          onOpen={() => undefined}
          onToggle={(id) => activityRepository.toggleDone(id)}
          onCreateAt={comingSoon}
          onPlanDay={comingSoon}
          onAddInGap={comingSoon}
        />
      </View>
    </View>
  );
}
