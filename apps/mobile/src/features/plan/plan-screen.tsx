import {
  ActivityKind,
  changeSummary,
  dailyProgress,
  EditScope,
  EntryPoint,
  layoutDay,
  minutesOfDay,
  PHONE_SCALE,
  todayISO,
  type DayLayout,
  type Habit,
  type MinutesOfDay,
  type Timing,
} from '@daycraft/domain';
import { router, useNavigation } from 'expo-router';
import { useCallback, useEffect, useRef, type ComponentRef } from 'react';
import { ScrollView, View } from 'react-native';

import { TabRoute, useToast } from '@/components/ui';
import { activityRepository, useDayActivities } from '@/data/activity-store';
import { habitRepository, toggleCheckIn, useCheckedHabitIds, useHabitsOn } from '@/data/habit-store';
import { hasOnboarded } from '@/features/onboarding/onboarding-store';
import { askScope, ScopeAction, scopeToastSuffix } from '@/features/repeat/ask-scope';
import { useNow } from '@/lib/use-now';
import { useTopInset } from '@/lib/use-top-inset';

import { HabitRow } from './habit-row';
import { PlanHeader } from './plan-header';
import { selectDate, useJustCreatedId, useLandings, useSelectedDate } from './plan-state';
import { Timeline } from './timeline';
import { useTimelineDrag } from './use-timeline-drag';

// Where Plan lands (timeline guide §11): the now line 170pt from the top on today, else the first activity 10pt from it.
const NOW_OFFSET = 170;
const FIRST_ROW_OFFSET = 10;
// A landing can be asked for before the day is laid out: Plan is revealed while onboarding is still saving its
// rows. Content that gets its size within this long of landing lands again, with the day then on screen.
const LANDED_GRACE_MS = 1000;

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

export function PlanScreen() {
  const topInset = useTopInset();
  const clock = useNow();
  const today = todayISO(clock);
  const date = useSelectedDate(today);
  const justCreatedId = useJustCreatedId();
  const landings = useLandings();
  const activities = useDayActivities(date);
  const now = minutesOfDay(clock);
  const toast = useToast();
  const habits = useHabitsOn(date);
  const checkedHabitIds = useCheckedHabitIds(date);
  // No habit row during onboarding: no habits exist yet, and the + is not on the sheet there (Q26).
  const showHabitRow = hasOnboarded();
  // The row checks in the date Plan selects, on or before today (Q16); a future date is blocked.
  const toggleHabit = (habit: Habit) => {
    if (date > today) {
      toast('Habits can be checked in on or before today');
      return;
    }
    const checked = toggleCheckIn(habit.id, date);
    toast(checked ? `${habit.name} · checked in` : `${habit.name} · unchecked`);
  };
  const drag = useTimelineDrag(async ({ id, timing, message }) => {
    const moved = activities.find((item) => item.id === id);
    // A repeating activity asks first whether the move is for this date only or for the series too.
    let scope: EditScope = EditScope.THIS;
    if (moved?.seriesId) {
      const { id: _id, ...saved } = moved;
      const asked = await askScope({
        action: ScopeAction.UPDATE,
        summary: changeSummary(saved, { ...saved, start: timing.start, durationMinutes: timing.durationMinutes }),
        noun: moved.kind === ActivityKind.EVENT ? 'event' : 'task',
      });
      if (!asked) return;
      scope = asked;
    }
    activityRepository.reschedule(id, timing, scope);
    toast(`${message}${scopeToastSuffix(scope)}`);
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
  const landedAt = useRef(0);
  const land = useCallback(() => {
    landedAt.current = Date.now();
    scrollToLanding();
  }, [scrollToLanding]);

  useEffect(land, [date, landings, land]);

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
      if (leftPlanTab.current) land();
      leftPlanTab.current = false;
    });
    return () => {
      stopBlur();
      stopFocus();
    };
  }, [navigation, land]);

  return (
    <View style={{ paddingTop: topInset }} className="flex-1 bg-canvas">
      <PlanHeader
        date={date}
        today={today}
        progress={dailyProgress(activities, { habits, checkedIds: checkedHabitIds })}
        onSelectDate={selectDate}
      />
      <View className="mt-2 flex-1 overflow-hidden rounded-t-sheet border-t border-line bg-surface">
        {showHabitRow && (
          <HabitRow
            habits={habits}
            checkedIds={checkedHabitIds}
            onToggleHabit={toggleHabit}
            onAddHabit={() => router.push('/habit/new')}
          />
        )}
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
          onContentSizeChange={() => {
            if (Date.now() - landedAt.current < LANDED_GRACE_MS) scrollToLanding();
          }}
        />
      </View>
    </View>
  );
}
