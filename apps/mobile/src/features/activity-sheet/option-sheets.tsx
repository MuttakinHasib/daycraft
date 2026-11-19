import { hueColors } from '@daycraft/design-tokens';
import {
  ACTIVITY_ICONS,
  ActivityHue,
  Priority,
  type ActivityInput,
  type ActivityHue as Hue,
  type IconName,
  type ISODate,
  type Priority as PriorityLevel,
} from '@daycraft/domain';
import { useState, type ReactNode } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Button, Icon } from '@/components/ui';
import { MonthPicker } from '@/features/plan/month-picker';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme/app-theme';

import { SubSheetHeader } from './sub-sheet';

const ICON_CELL_WIDTH = `${100 / 6}%` as const;

export const PRIORITY_LABEL: Record<PriorityLevel, string> = {
  none: 'None',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const HUE_NAMES: Record<Hue, string> = {
  clay: 'Clay',
  amber: 'Amber',
  sun: 'Sun',
  sage: 'Sage',
  pine: 'Pine',
  sky: 'Sky',
  iris: 'Iris',
  rose: 'Rose',
  slate: 'Slate',
};

/** What the colour sheet changes: the hue, the icon or both. */
export type AppearanceChange = Partial<Pick<ActivityInput, 'hue' | 'icon'>>;

interface SectionProps {
  label: string;
  children: ReactNode;
}

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

interface ColourSheetProps {
  hue: Hue;
  icon: IconName;
  onChange: (change: AppearanceChange) => void;
  onClose: () => void;
}

interface LocationSheetProps {
  value: string;
  onDone: (location: string) => void;
  onClose: () => void;
}

function Section({ label, children }: SectionProps) {
  return (
    <View className="gap-3">
      <Text className="type-body font-sans-semibold text-ink">{label}</Text>
      {children}
    </View>
  );
}

/** Plan's month grid with Today: picking a day sets it and closes the sheet. */
export function DateSheet({ date, today, onPick, onClose }: DateSheetProps) {
  return (
    <MonthPicker
      selected={date}
      today={today}
      onPick={onPick}
      onClose={onClose}
      onToday={() => onPick(today)}
      inkSelection
    />
  );
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

/** The activity's hue and icon; both apply as they are tapped. */
export function ColourSheet({ hue, icon, onChange, onClose }: ColourSheetProps) {
  return (
    <View>
      <SubSheetHeader title="Colour and icon" onClose={onClose} />
      <View className="gap-6 px-5">
        <Section label="Colour">
          <View className="flex-row justify-between">
            {Object.values(ActivityHue).map((option) => {
              const selected = option === hue;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityLabel={HUE_NAMES[option]}
                  accessibilityState={{ selected }}
                  hitSlop={4}
                  onPress={() => onChange({ hue: option })}
                  style={{ backgroundColor: hueColors[option] }}
                  className="size-8 rounded-full"
                >
                  {selected && <View className="absolute -inset-1 rounded-full border-2 border-ink" />}
                </Pressable>
              );
            })}
          </View>
        </Section>
        <Section label="Icon">
          <View className="flex-row flex-wrap gap-y-2.5">
            {ACTIVITY_ICONS.map((option) => {
              const selected = option === icon;
              return (
                <View key={option} style={{ width: ICON_CELL_WIDTH }} className="items-center">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={option}
                    accessibilityState={{ selected }}
                    onPress={() => onChange({ icon: option })}
                    style={selected ? { backgroundColor: hueColors[hue] } : undefined}
                    className={cn('size-11 items-center justify-center rounded-full', { 'bg-sunken': !selected })}
                  >
                    <Icon
                      name={option}
                      size={20}
                      colorClassName={cn({ 'text-ink-muted': !selected, 'text-on-hue': selected })}
                    />
                  </Pressable>
                </View>
              );
            })}
          </View>
        </Section>
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
