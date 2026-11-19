import { todayISO } from '@daycraft/domain';
import { router } from 'expo-router';
import { useState } from 'react';

import { MonthPicker } from '@/features/plan/month-picker';
import { selectDate, selectedDateOr } from '@/features/plan/plan-state';

/** The month picker sheet, opened from Plan's date title. */
export default function MonthPickerRoute() {
  const [today] = useState(() => todayISO(new Date()));
  return (
    <MonthPicker
      selected={selectedDateOr(today)}
      today={today}
      onPick={(date) => {
        selectDate(date);
        router.back();
      }}
      onClose={() => router.back()}
    />
  );
}
