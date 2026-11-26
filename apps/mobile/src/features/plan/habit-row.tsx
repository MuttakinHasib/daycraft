import { sheetHeaderTint, withOpacity } from '@daycraft/design-tokens';
import type { Habit, ISODate } from '@daycraft/domain';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ActivityHueText, colorValue, Icon } from '@/components/ui';
import { useColorScheme } from '@/theme/app-theme';

// The row above the timeline (navigation-and-modules): horizontally scrolling 44pt circles 56pt apart, each
// with an 11pt label below; the last one is "+ Habit". Dashed until checked, solid with a badge once checked.

interface HabitCircleProps {
  habit: Habit;
  checked: boolean;
  /** A habit that no longer existed on the date is shown as it was, not a button. */
  readOnly?: boolean;
  onToggle?: () => void;
}

/** One habit's circle and label: dashed in its hue until checked, solid with a check badge once checked. */
function HabitCircle({ habit, checked, readOnly = false, onToggle }: HabitCircleProps) {
  const scheme = useColorScheme();
  const circle = (
    <View
      style={
        checked
          ? { backgroundColor: colorValue(habit.hue) }
          : {
              borderColor: colorValue(habit.hue),
              borderStyle: 'dashed',
              backgroundColor: withOpacity(colorValue(habit.hue), sheetHeaderTint[scheme]),
            }
      }
      className="size-11 items-center justify-center rounded-full border-2"
    >
      <Icon name={habit.icon} size={18} colorClassName={checked ? 'text-on-hue' : ActivityHueText[habit.hue]} />
      {checked && (
        <View className="absolute -bottom-0.5 -right-0.5 size-5 items-center justify-center rounded-full bg-ink">
          <Icon name="check" size={11} strokeWidth={3} colorClassName="text-canvas" />
        </View>
      )}
    </View>
  );
  if (readOnly) {
    return (
      <View style={{ width: 56 }} className="items-center gap-1.5 opacity-60">
        {circle}
        <Text numberOfLines={1} className="type-micro font-sans-medium text-ink">
          {habit.name}
        </Text>
      </View>
    );
  }
  return (
    <View style={{ width: 56 }} className="items-center gap-1.5">
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={`${habit.name}${checked ? ', checked in' : ''}`}
        onPress={onToggle}
        className="active:opacity-80"
      >
        {circle}
      </Pressable>
      <Text numberOfLines={1} className="type-micro font-sans-medium text-ink">
        {habit.name}
      </Text>
    </View>
  );
}

interface AddHabitCircleProps {
  onPress: () => void;
}

/** The dashed trailing circle that opens the New habit sheet. */
function AddHabitCircle({ onPress }: AddHabitCircleProps) {
  return (
    <View style={{ width: 56 }} className="items-center gap-1.5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="New habit"
        onPress={onPress}
        className="size-11 items-center justify-center rounded-full border-2 border-dashed border-line-strong active:opacity-80"
      >
        <Icon name="plus" size={18} colorClassName="text-ink-subtle" />
      </Pressable>
      <Text className="type-micro font-sans-medium text-ink">Habit</Text>
    </View>
  );
}

interface HabitRowProps {
  habits: readonly Habit[];
  /** The date the row shows, for the read-only rule and the toggle. */
  date: ISODate;
  /** The ids checked in on `date`, from the repository. */
  checkedIds: readonly string[];
  onToggleHabit: (habit: Habit) => void;
  onAddHabit: () => void;
}

/** Plan's habit row: always present, even with no habits, ending in the + circle. */
export function HabitRow({ habits, date, checkedIds, onToggleHabit, onAddHabit }: HabitRowProps) {
  const checked = new Set(checkedIds);
  return (
    <View className="border-b border-line">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-1 px-5 pb-3 pt-3.5"
      >
        {habits.map((habit) => (
          <HabitCircle
            key={habit.id}
            habit={habit}
            checked={checked.has(habit.id)}
            readOnly={habit.deletedDate !== null && date >= habit.deletedDate}
            onToggle={() => onToggleHabit(habit)}
          />
        ))}
        <AddHabitCircle onPress={onAddHabit} />
      </ScrollView>
    </View>
  );
}
