import { ActivityHue, formatShortDateWithYear, todayISO, validateGoalName, type ISODate } from '@daycraft/domain';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Button, colorValue, Icon, IconButton, IconButtonSize, useToast } from '@/components/ui';
import { goalRepository } from '@/data/goal-store';
import { HUE_NAMES, HueSheet } from '@/features/activity-sheet/colour-sheets';
import { DateSheet } from '@/features/activity-sheet/option-sheets';
import { SubSheet } from '@/features/activity-sheet/sub-sheet';
import { useNow } from '@/lib/use-now';
import { useThemeColors } from '@/theme/app-theme';

// The goal sheet (New goal): the button is always enabled and a blank title toasts "Name your goal first"
// instead of saving. The hue row opens the hue-only sub-sheet; the Target date row opens the date sheet, whose
// Clear removes the date.

export function GoalSheet() {
  const toast = useToast();
  const colors = useThemeColors();
  const today = todayISO(useNow());
  const [title, setTitle] = useState('');
  const [hue, setHue] = useState<ActivityHue>(ActivityHue.SAGE);
  const [targetDate, setTargetDate] = useState<ISODate | null>(null);
  const [hueOpen, setHueOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const save = () => {
    const message = validateGoalName(title);
    if (message) {
      toast(message);
      return;
    }
    goalRepository.create({ title: title.trim(), hue, targetDate: targetDate ?? undefined });
    toast('Goal added');
    router.back();
  };

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-row items-center justify-between px-5 pt-4">
        <Text accessibilityRole="header" className="type-heading text-ink">
          New goal
        </Text>
        <IconButton icon="x" size={IconButtonSize.LG} accessibilityLabel="Close" onPress={() => router.back()} />
      </View>
      <View className="px-5 pt-6">
        <TextInput
          accessibilityLabel="Goal title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Run a half marathon"
          placeholderTextColor={colors['ink-subtle']}
          className="h-11 border-b border-line type-heading text-ink"
        />
      </View>
      <View className="px-5 pt-6">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Colour: ${HUE_NAMES[hue]}`}
          onPress={() => setHueOpen(true)}
          className="h-14 flex-row items-center gap-3 rounded-card bg-card px-4 active:opacity-70"
        >
          <View style={{ backgroundColor: colorValue(hue) }} className="size-6 rounded-full" />
          <Text className="flex-1 type-body font-sans-medium text-ink">Colour</Text>
          <Text className="type-body text-ink-muted">{HUE_NAMES[hue]}</Text>
          <Icon name="chev-r" size={16} colorClassName="text-ink-subtle" />
        </Pressable>
      </View>
      <View className="px-5 pt-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Target date: ${targetDate ? formatShortDateWithYear(targetDate) : 'None'}`}
          onPress={() => setDateOpen(true)}
          className="h-14 flex-row items-center gap-3 rounded-card bg-card px-4 active:opacity-70"
        >
          <Icon name="calendar" size={18} colorClassName="text-ink-subtle" />
          <Text className="flex-1 type-body font-sans-medium text-ink">Target date</Text>
          <Text className="type-body text-ink-muted">
            {targetDate ? formatShortDateWithYear(targetDate) : 'None'}
          </Text>
          <Icon name="chev-r" size={16} colorClassName="text-ink-subtle" />
        </Pressable>
      </View>
      <View className="absolute inset-x-0 bottom-0 px-5 pb-8">
        <Button onPress={save}>Add goal</Button>
      </View>
      {hueOpen && (
        <SubSheet onClose={() => setHueOpen(false)}>
          <HueSheet hue={hue} onChange={setHue} onClose={() => setHueOpen(false)} />
        </SubSheet>
      )}
      {dateOpen && (
        <SubSheet onClose={() => setDateOpen(false)}>
          <DateSheet
            date={targetDate ?? today}
            today={today}
            onPick={(date) => {
              setTargetDate(date);
              setDateOpen(false);
            }}
            onClear={() => {
              setTargetDate(null);
              setDateOpen(false);
            }}
            onClose={() => setDateOpen(false)}
          />
        </SubSheet>
      )}
    </View>
  );
}
