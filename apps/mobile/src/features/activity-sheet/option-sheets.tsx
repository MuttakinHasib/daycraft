import { Priority, Repeat, type ISODate, type Priority as PriorityLevel } from '@daycraft/domain';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Button, Icon, Segmented } from '@/components/ui';
import { MonthPicker } from '@/features/plan/month-picker';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme/app-theme';

import { SubSheetHeader } from './sub-sheet';

const REPEAT_OPTIONS = [
  { value: Repeat.NEVER, label: 'Once' },
  { value: Repeat.DAILY, label: 'Daily' },
  { value: Repeat.WEEKLY, label: 'Weekly' },
  { value: Repeat.MONTHLY, label: 'Monthly' },
] as const;

export const PRIORITY_LABEL: Record<PriorityLevel, string> = {
  none: 'None',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

interface DateSheetProps {
  date: ISODate;
  today: ISODate;
  onPick: (date: ISODate) => void;
  onClose: () => void;
}

interface PrioritySheetProps {
  value: PriorityLevel;
  onPick: (priority: PriorityLevel) => void;
  onClose: () => void;
}

interface RepeatSheetProps {
  value: Repeat;
  onChange: (repeat: Repeat) => void;
  onClose: () => void;
}

interface LocationSheetProps {
  value: string;
  onDone: (location: string) => void;
  onClose: () => void;
}

/** Plan's month grid with Today: picking a day sets it and closes the sheet. */
export function DateSheet({ date, today, onPick, onClose }: DateSheetProps) {
  return <MonthPicker selected={date} today={today} onPick={onPick} onClose={onClose} onToday={() => onPick(today)} />;
}

/** None, Low, Medium or High; picking one closes the sheet. */
export function PrioritySheet({ value, onPick, onClose }: PrioritySheetProps) {
  return (
    <View>
      <SubSheetHeader title="Priority" onClose={onClose} />
      <View className="mx-5 overflow-hidden rounded-card bg-card">
        {Object.values(Priority).map((priority, index) => {
          const selected = priority === value;
          return (
            <Pressable
              key={priority}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onPick(priority)}
              className={cn('h-14 flex-row items-center gap-3 px-4 active:bg-sunken', {
                'border-t border-line': index > 0,
              })}
            >
              <Icon
                name="flag"
                size={20}
                colorClassName={cn({
                  'text-danger': priority === Priority.HIGH,
                  'text-ink-subtle': priority !== Priority.HIGH,
                })}
              />
              <Text className="flex-1 type-body text-ink">{PRIORITY_LABEL[priority]}</Text>
              {selected && <Icon name="check" size={18} strokeWidth={2.5} colorClassName="text-accent-text" />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Once, Daily, Weekly or Monthly; the choice applies at once. */
export function RepeatSheet({ value, onChange, onClose }: RepeatSheetProps) {
  return (
    <View>
      <SubSheetHeader title="Repeat" onClose={onClose} />
      <View className="px-5 pb-2">
        <Segmented
          options={REPEAT_OPTIONS}
          // A stored "Weekdays" (no longer offered) shows no selection until another is picked.
          value={value}
          onChange={onChange}
          accessibilityLabel="Repeat"
        />
      </View>
    </View>
  );
}

/** An event's place or link. */
export function LocationSheet({ value, onDone, onClose }: LocationSheetProps) {
  const colors = useThemeColors();
  const [location, setLocation] = useState(value);
  return (
    <View>
      <SubSheetHeader title="Location" onClose={onClose} />
      <View className="gap-4 px-5">
        <View className="h-12 flex-row items-center gap-2.5 rounded-field bg-sunken px-4">
          <Icon name="pin" size={18} colorClassName="text-ink-subtle" />
          <TextInput
            accessibilityLabel="Location"
            autoFocus
            value={location}
            onChangeText={setLocation}
            onSubmitEditing={() => onDone(location.trim())}
            returnKeyType="done"
            placeholder="Add a place or link"
            placeholderTextColor={colors['ink-subtle']}
            className="h-full flex-1 type-body text-ink"
          />
        </View>
        <Button onPress={() => onDone(location.trim())}>Done</Button>
      </View>
    </View>
  );
}
