import { duplicateDraft, editorDefaults, EntryPoint, minutesOfDay, todayISO } from '@daycraft/domain';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { activityRepository } from '@/data/activity-store';
import { ActivitySheet } from '@/features/activity-sheet/activity-sheet';
import { selectedDateOr } from '@/features/plan/plan-state';

const ENTRY_POINTS: ReadonlySet<string> = new Set(Object.values(EntryPoint));

function optionalNumber(value: string | undefined): number | undefined {
  if (value === undefined || value === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

/** The activity sheet for a new task, pre-filled for the entry point it was opened from, or a copy (`from`). */
export default function NewActivityRoute() {
  const params = useLocalSearchParams<{ entry?: string; start?: string; duration?: string; from?: string }>();
  const [setup] = useState(() => {
    const clock = new Date();
    const today = todayISO(clock);
    const original = params.from ? activityRepository.readActivity(params.from) : null;
    if (original) return { today, initial: duplicateDraft(original) };
    const date = selectedDateOr(today);
    const entry = params.entry && ENTRY_POINTS.has(params.entry) ? (params.entry as EntryPoint) : EntryPoint.PLUS;
    const initial = editorDefaults({
      entry,
      date,
      today,
      now: minutesOfDay(clock),
      activities: activityRepository.readDay(date),
      start: optionalNumber(params.start),
      durationMinutes: optionalNumber(params.duration),
    });
    return { today, initial };
  });
  return <ActivitySheet initial={setup.initial} activityId={null} today={setup.today} />;
}
