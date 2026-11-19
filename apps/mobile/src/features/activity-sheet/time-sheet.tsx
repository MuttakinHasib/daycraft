import { clampToDay, clockParts, fromClockParts, type Timing } from '@daycraft/domain';
import { Text, View } from 'react-native';

import { Button, Chip, ChipSize } from '@/components/ui';

import { SubSheetHeader } from './sub-sheet';
import { Wheel } from './wheel';
import type { WheelOption } from './wheel-types';

const STEP = 5;
const PRESETS = [
  { minutes: 15, label: '15m' },
  { minutes: 30, label: '30m' },
  { minutes: 45, label: '45m' },
  { minutes: 60, label: '1h' },
  { minutes: 90, label: '1h 30m' },
  { minutes: 120, label: '2h' },
] as const;

const range = (count: number, from = 0): number[] => Array.from({ length: count }, (_, index) => from + index);
const HOURS_12: WheelOption[] = range(12, 1).map((hour) => ({ value: hour, label: String(hour) }));
const MINUTES: WheelOption[] = range(60 / STEP).map((index) => ({
  value: index * STEP,
  label: String(index * STEP).padStart(2, '0'),
}));
const PERIODS: WheelOption[] = [
  { value: 0, label: 'AM' },
  { value: 1, label: 'PM' },
];
const DURATION_HOURS: WheelOption[] = range(13).map((hour) => ({ value: hour, label: `${hour} hr` }));
const DURATION_MINUTES: WheelOption[] = range(60 / STEP).map((index) => ({
  value: index * STEP,
  label: `${index * STEP} min`,
}));

interface TimeSheetProps {
  timing: Timing;
  onChange: (timing: Timing) => void;
  onClose: () => void;
}

interface LabelProps {
  children: string;
}

function WheelLabel({ children }: LabelProps) {
  return <Text className="px-5 type-body font-sans-semibold text-ink">{children}</Text>;
}

/**
 * When it starts and how long it takes: a start wheel and a duration wheel in 5-minute steps, and preset lengths.
 * Every change applies at once, kept between 5:00 AM and midnight; Done closes the sheet.
 */
export function TimeSheet({ timing, onChange, onClose }: TimeSheetProps) {
  const start = clockParts(timing.start);
  // A point in time keeps 0; anything else is at least one 5-minute step.
  const duration = timing.durationMinutes;
  const setStart = (parts: Partial<typeof start>) =>
    onChange(clampToDay({ start: fromClockParts({ ...start, ...parts }), durationMinutes: duration }));
  const setDuration = (minutes: number) => onChange(clampToDay({ start: timing.start, durationMinutes: minutes }));
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  return (
    <View>
      <SubSheetHeader title="Time" onClose={onClose} />
      <WheelLabel>Starts</WheelLabel>
      <View className="mx-5 mt-2 overflow-hidden rounded-card bg-card">
        <Wheel
          accessibilityLabel="Start time"
          columns={[
            {
              key: 'hour',
              label: 'Hour',
              options: HOURS_12,
              value: start.hour,
              onChange: (hour) => setStart({ hour }),
            },
            {
              key: 'minute',
              label: 'Minutes',
              options: MINUTES,
              value: start.minute - (start.minute % STEP),
              onChange: (minute) => setStart({ minute }),
            },
            {
              key: 'period',
              label: 'AM or PM',
              options: PERIODS,
              value: start.pm ? 1 : 0,
              onChange: (period) => setStart({ pm: period === 1 }),
            },
          ]}
        />
      </View>
      <View className="mt-4">
        <WheelLabel>Duration</WheelLabel>
      </View>
      <View className="mx-5 mt-2 overflow-hidden rounded-card bg-card">
        <Wheel
          accessibilityLabel="Duration"
          columns={[
            {
              key: 'hours',
              label: 'Hours',
              options: DURATION_HOURS,
              value: hours,
              onChange: (value) => setDuration(Math.max(STEP, value * 60 + minutes)),
            },
            {
              key: 'minutes',
              label: 'Minutes',
              options: DURATION_MINUTES,
              value: minutes - (minutes % STEP),
              onChange: (value) => setDuration(Math.max(STEP, hours * 60 + value)),
            },
          ]}
        />
      </View>
      <View className="mt-3 flex-row flex-wrap gap-1.5 px-5">
        {PRESETS.map((preset) => (
          <Chip
            key={preset.minutes}
            size={ChipSize.SM}
            selected={duration === preset.minutes}
            onPress={() => setDuration(preset.minutes)}
          >
            {preset.label}
          </Chip>
        ))}
      </View>
      <View className="mt-4 px-5">
        <Button onPress={onClose}>Done</Button>
      </View>
    </View>
  );
}
