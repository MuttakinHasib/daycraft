import {
  dailyProgress,
  EntryPoint,
  layoutDay,
  minutesOfDay,
  PHONE_SCALE,
  todayISO,
  type DayLayout,
  type MinutesOfDay,
  type Timing,
} from '@daycraft/domain';
import { router, useNavigation } from 'expo-router';
import { useCallback, useEffect, useRef, type ComponentRef } from 'react';
import { ScrollView, View } from 'react-native';

import { TabRoute, useToast } from '@/components/ui';
import { activityRepository, useDayActivities } from '@/data/activity-store';
import { useNow } from '@/lib/use-now';

import { PlanHeader } from './plan-header';
import { selectDate, useJustCreatedId, useSelectedDate } from './plan-state';
import { Timeline } from './timeline';
import { useTimelineDrag } from './use-timeline-drag';

// Where Plan lands (timeline guide §11): the now line 170pt from the top on today, else the first activity 10pt from it.
const NOW_OFFSET = 170;
const FIRST_ROW_OFFSET = 10;

function openEditorAt(start: MinutesOfDay) {
  router.push({ pathname: '/activity/new', params: { entry: EntryPoint.SLOT, start } });
}

function openEditorInGap(timing: Timing) {
  router.push({
    pathname: '/activity/new',
    params: { entry: EntryPoint.FREE_TIME, start: timing.start, duration: timing.durationMinutes },
  });
}

function planDay() {
  router.push({ pathname: '/activity/new', params: { entry: EntryPoint.PLAN_DAY } });
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
  const date = useSelectedDate(today);
  const justCreatedId = useJustCreatedId();
  const activities = useDayActivities(date);
  const now = minutesOfDay(clock);
  const toast = useToast();
  const drag = useTimelineDrag(({ id, timing, message }) => {
    activityRepository.reschedule(id, timing);
    toast(message);
  });
  const layout = layoutDay({ activities, scale: PHONE_SCALE, isToday: date === today, now, preview: drag.preview });
  const toggleDone = (id: string) => {
    const activity = activityRepository.toggleDone(id);
    toast(activity.done ? `Done · ${activity.title}` : 'Marked as not done');
  };
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

  // Land again when Plan's tab is chosen after another tab, but not when a sheet over Plan closes:
  // a sheet also blurs Plan, yet Plan stays the selected tab.
  const navigation = useNavigation();
  const leftPlanTab = useRef(false);
  useEffect(() => {
    const stopBlur = navigation.addListener('blur', () => {
      const state = navigation.getState();
      leftPlanTab.current = state?.routes[state.index]?.name !== TabRoute.PLAN;
    });
    const stopFocus = navigation.addListener('focus', () => {
      if (leftPlanTab.current) scrollToLanding();
      leftPlanTab.current = false;
    });
    return () => {
      stopBlur();
      stopFocus();
    };
  }, [navigation, scrollToLanding]);

  return (
    <View className="flex-1 bg-canvas pt-safe">
      <PlanHeader date={date} today={today} progress={dailyProgress(activities)} onSelectDate={selectDate} />
      <View className="mt-2 flex-1 overflow-hidden rounded-t-sheet border-t border-line bg-surface">
        <View className="h-4.5 items-center justify-center">
          <View className="h-1 w-9 rounded-full bg-line-strong" />
        </View>
        <Timeline
          layout={layout}
          now={now}
          scrollRef={scrollRef}
          onOpen={(id) => router.push({ pathname: '/activity/[id]', params: { id } })}
          onToggle={toggleDone}
          justCreatedId={justCreatedId}
          drag={drag}
          onCreateAt={openEditorAt}
          onPlanDay={planDay}
          onAddInGap={openEditorInGap}
        />
      </View>
    </View>
  );
}
