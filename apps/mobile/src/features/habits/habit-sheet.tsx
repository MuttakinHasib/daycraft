import { ActivityHue, HabitFrequency, isActivityHue, validateHabitName, type Habit, type IconName } from '@daycraft/domain';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Button, colorValue, Icon, inkClassOn, IconButton, IconButtonSize, Segmented, useToast } from '@/components/ui';
import { habitRepository } from '@/data/habit-store';
import { ColourIconSheet } from '@/features/activity-sheet/colour-sheets';
import { SubSheet } from '@/features/activity-sheet/sub-sheet';
import { useThemeColors } from '@/theme/app-theme';

// The habit sheet (reference: sheet-new-habit, prototype's save behaviour): the button is always enabled and a
// blank name toasts "Name your habit first" instead of saving. Colour and icon change in the activity sheet's
// own picker (Q9). Edit habit opens the same sheet pre-filled and saves in place.

// The Target range for a weekly habit (glossary): 1 to 7.
const TARGET_MIN = 1;
const TARGET_MAX = 7;

interface HabitSheetProps {
  /** Pre-fills the sheet for Edit habit. */
  habit?: Habit;
}

export function HabitSheet({ habit }: HabitSheetProps) {
  const toast = useToast();
  const colors = useThemeColors();
  const [name, setName] = useState(habit?.name ?? '');
  const [hue, setHue] = useState<ActivityHue>(habit?.hue ?? ActivityHue.SAGE);
  const [icon, setIcon] = useState<IconName>(habit?.icon ?? 'leaf');
  const [frequency, setFrequency] = useState<HabitFrequency>(habit?.frequency ?? HabitFrequency.DAILY);
  const [target, setTarget] = useState(habit?.target ?? 3);
  const [colourOpen, setColourOpen] = useState(false);

  const save = () => {
    const message = validateHabitName(name);
    if (message) {
      toast(message);
      return;
    }
    const changes = {
      name: name.trim(),
      icon,
      hue,
      frequency,
      target: frequency === HabitFrequency.WEEKLY ? target : null,
    };
    if (habit) {
      habitRepository.update(habit.id, changes);
      toast('Habit saved');
    } else {
      habitRepository.create(changes);
      toast('Habit added · tap it to check in');
    }
    router.back();
  };

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-row items-center justify-between px-5 pt-4">
        <Text accessibilityRole="header" className="type-heading text-ink">
          {habit ? 'Edit habit' : 'New habit'}
        </Text>
        <IconButton icon="x" size={IconButtonSize.LG} accessibilityLabel="Close" onPress={() => router.back()} />
      </View>
      <View className="flex-row items-center gap-4 px-5 pt-6">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Colour and icon"
          onPress={() => setColourOpen(true)}
          style={{ backgroundColor: colorValue(hue) }}
          className="size-14 items-center justify-center rounded-full active:opacity-80"
        >
          <Icon name={icon} size={24} colorClassName={inkClassOn(hue)} />
        </Pressable>
        <TextInput
          accessibilityLabel="Habit name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Drink water, Stretch"
          placeholderTextColor={colors['ink-subtle']}
          className="h-11 flex-1 border-b border-line type-heading text-ink"
        />
      </View>
      <View className="gap-2 px-5 pt-6">
        <Text className="type-body font-sans-semibold text-ink">How often</Text>
        <Segmented
          options={[
            { value: HabitFrequency.DAILY, label: 'Every day' },
            { value: HabitFrequency.WEEKLY, label: 'Weekly' },
          ]}
          value={frequency}
          onChange={setFrequency}
          accessibilityLabel="How often"
        />
        {frequency === HabitFrequency.WEEKLY && (
          <View className="flex-row items-center justify-center gap-6 py-1">
            <IconButton
              icon="minus"
              size={IconButtonSize.LG}
              accessibilityLabel="One day less a week"
              onPress={() => setTarget((current) => Math.max(TARGET_MIN, current - 1))}
            />
            <Text className="type-activity font-sans-semibold text-ink">{target}× a week</Text>
            <IconButton
              icon="plus"
              size={IconButtonSize.LG}
              accessibilityLabel="One day more a week"
              onPress={() => setTarget((current) => Math.min(TARGET_MAX, current + 1))}
            />
          </View>
        )}
      </View>
      <View className="absolute inset-x-0 bottom-0 px-5 pb-8">
        <Button onPress={save}>{habit ? 'Save' : 'Add habit'}</Button>
      </View>
      {colourOpen && (
        <SubSheet onClose={() => setColourOpen(false)}>
          <ColourIconSheet
            color={hue}
            icon={icon}
            title={name}
            onChange={(change) => {
              if (change.hue && isActivityHue(change.hue)) setHue(change.hue);
              if (change.icon) setIcon(change.icon);
            }}
            onClose={() => setColourOpen(false)}
          />
        </SubSheet>
      )}
    </View>
  );
}
