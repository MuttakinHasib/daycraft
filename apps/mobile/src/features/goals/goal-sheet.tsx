import {
  ActivityHue,
  formatShortDateWithYear,
  todayISO,
  validateGoalName,
  type Goal,
  type ISODate,
  type MilestoneChange,
} from '@daycraft/domain';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Button, Chip, ChipTone, colorValue, Icon, IconButton, IconButtonSize, useToast } from '@/components/ui';
import { goalRepository } from '@/data/goal-store';
import { HUE_NAMES, HueSheet } from '@/features/activity-sheet/colour-sheets';
import { DateSheet } from '@/features/activity-sheet/option-sheets';
import { SubSheet } from '@/features/activity-sheet/sub-sheet';
import { useNow } from '@/lib/use-now';
import { useThemeColors } from '@/theme/app-theme';

// The goal sheet (New goal and Edit goal): the button is always enabled and a blank title toasts "Name your goal
// first" instead of saving. Edit opens pre-filled and saves in place, keeping a kept milestone's done flag and
// dropping a removed one. The Target date row opens the date sheet, whose Clear removes the date; the hue row
// opens the hue-only sub-sheet; milestones are composed below in the order they are added, with no cap. They
// are checked on the card, not here.

// iOS draws a single-line field's text below center when it has a line height; 0 leaves the font's own.
const ONE_LINE_FIELD = { lineHeight: 0 };

interface GoalSheetProps {
  /** Pre-fills the sheet for Edit goal. */
  goal?: Goal;
}

export function GoalSheet({ goal }: GoalSheetProps) {
  const toast = useToast();
  const colors = useThemeColors();
  const today = todayISO(useNow());
  const [title, setTitle] = useState(goal?.title ?? '');
  const [description, setDescription] = useState(goal?.description ?? '');
  const [hue, setHue] = useState<ActivityHue>(goal?.hue ?? ActivityHue.SAGE);
  const [targetDate, setTargetDate] = useState<ISODate | null>(goal?.targetDate ?? null);
  const [hueOpen, setHueOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [milestones, setMilestones] = useState<MilestoneChange[]>(
    goal ? goal.milestones.map((milestone) => ({ id: milestone.id, title: milestone.title })) : [],
  );
  const [draft, setDraft] = useState('');

  const addMilestone = () => {
    const name = draft.trim();
    if (!name) return;
    setMilestones((current) => [...current, { title: name }]);
    setDraft('');
  };

  const removeMilestone = (index: number) => {
    setMilestones((current) => current.filter((_, position) => position !== index));
  };

  const save = () => {
    const message = validateGoalName(title);
    if (message) {
      toast(message);
      return;
    }
    if (goal) {
      goalRepository.update(goal.id, {
        title: title.trim(),
        description: description.trim() || null,
        hue,
        targetDate,
        milestones,
      });
      toast('Goal saved');
    } else {
      goalRepository.create({
        title: title.trim(),
        description: description.trim() || undefined,
        hue,
        targetDate: targetDate ?? undefined,
        milestones,
      });
      toast('Goal added');
    }
    router.back();
  };

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-row items-center justify-between px-5 pt-4">
        <Text accessibilityRole="header" className="type-heading text-ink">
          {goal ? 'Edit goal' : 'New goal'}
        </Text>
        <IconButton icon="x" size={IconButtonSize.LG} accessibilityLabel="Close" onPress={() => router.back()} />
      </View>
      {/* Native form sheets lay out a direct ScrollView child specially; wrapping it keeps the header in place.
          The milestone list has no cap, so the fields scroll rather than growing past the save button. */}
      <View collapsable={false} className="flex-1">
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode="interactive"
          contentContainerClassName="pb-32"
        >
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
          <View className="px-5 pt-4">
            <TextInput
              accessibilityLabel="Goal description"
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="Add a description"
              placeholderTextColor={colors['ink-subtle']}
              textAlignVertical="top"
              className="min-h-11 border-b border-line type-body text-ink-muted"
            />
          </View>
          <View className="px-5 pt-6">
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
          <View className="px-5 pt-6">
            <View className="overflow-hidden rounded-card bg-card">
              <Text className="px-4 pt-3.5 pb-1 type-meta font-sans-semibold text-ink-subtle">Milestones</Text>
              <View className="flex-row items-center gap-2 px-4 pb-3">
                <TextInput
                  accessibilityLabel="New milestone"
                  value={draft}
                  onChangeText={setDraft}
                  onSubmitEditing={addMilestone}
                  returnKeyType="done"
                  submitBehavior="submit"
                  placeholder="Add a milestone"
                  placeholderTextColor={colors['ink-subtle']}
                  style={ONE_LINE_FIELD}
                  className="h-11 flex-1 rounded-field bg-sunken px-4 type-body text-ink"
                />
                <Chip tone={ChipTone.ACCENT} icon="plus" onPress={addMilestone} accessibilityLabel="Add milestone">
                  Add
                </Chip>
              </View>
              {milestones.map((milestone, index) => (
                <View key={index} className="h-12 flex-row items-center border-t border-line pl-4">
                  <Text numberOfLines={1} className="flex-1 pr-3 type-body text-ink">
                    {milestone.title}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${milestone.title}`}
                    hitSlop={8}
                    onPress={() => removeMilestone(index)}
                    className="size-11 items-center justify-center"
                  >
                    <Icon name="x" size={15} colorClassName="text-ink-subtle" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
      <View className="absolute inset-x-0 bottom-0 px-5 pb-8">
        <Button onPress={save}>{goal ? 'Save' : 'Add goal'}</Button>
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
