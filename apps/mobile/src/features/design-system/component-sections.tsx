import { ActivityHue, ThemePreference } from '@daycraft/domain';
import { useState } from 'react';
import { Text, View } from 'react-native';

import {
  Button,
  ButtonSize,
  ButtonVariant,
  Capsule,
  CapsuleState,
  CheckRing,
  Chip,
  ChipSize,
  Icon,
  Segmented,
  Tag,
} from '@/components/ui';
import { useThemePreference } from '@/theme/app-theme';

import { Section } from './section';

const THEME_OPTIONS = [
  { value: ThemePreference.SYSTEM, label: 'System' },
  { value: ThemePreference.LIGHT, label: 'Light' },
  { value: ThemePreference.DARK, label: 'Dark' },
] as const;

const FILTER_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'today', label: 'Today' },
  { value: 'unscheduled', label: 'Unscheduled' },
  { value: 'done', label: 'Done' },
] as const;

export function AppearanceSection() {
  const { preference, setPreference } = useThemePreference();
  return (
    <Section title="Appearance" description="Saved on this device. System follows the phone.">
      <Segmented options={THEME_OPTIONS} value={preference} onChange={setPreference} accessibilityLabel="Appearance" />
    </Section>
  );
}

export function ButtonSection() {
  return (
    <Section title="Buttons" description="Display only: these specimens are not wired to actions.">
      {/* Specimens take no touches and read as one group, so none is a button that does nothing. */}
      <View
        pointerEvents="none"
        accessible
        accessibilityLabel="Button specimens, display only: Add to timeline, Cancel, Save, and a disabled button"
        className="gap-3"
      >
        <Button icon="plus">Add to timeline</Button>
        <Button variant={ButtonVariant.SECONDARY}>Cancel</Button>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button size={ButtonSize.MD}>Save</Button>
          </View>
          <View className="flex-1">
            <Button size={ButtonSize.MD} disabled>
              Disabled
            </Button>
          </View>
        </View>
      </View>
    </Section>
  );
}

export function ChipSection() {
  const [selected, setSelected] = useState('work');
  const labels = ['work', 'personal', 'health'] as const;
  return (
    <Section title="Chips and tags" description="The label chips toggle; the Plan chip is display only.">
      <View className="flex-row flex-wrap gap-2">
        {labels.map((label) => (
          <Chip key={label} selected={selected === label} onPress={() => setSelected(label)}>
            {label}
          </Chip>
        ))}
        <View pointerEvents="none" accessible accessibilityLabel="Plan chip specimen, display only">
          <Chip size={ChipSize.SM} icon="plus">
            Plan
          </Chip>
        </View>
      </View>
      <View className="flex-row flex-wrap gap-2">
        <Tag icon="pin">Studio</Tag>
        <Tag icon="checksq">2/4</Tag>
        <Tag>Event</Tag>
      </View>
    </Section>
  );
}

export function SegmentedSection() {
  const [filter, setFilter] = useState<(typeof FILTER_OPTIONS)[number]['value']>('open');
  return (
    <Section title="Segmented control">
      <Segmented options={FILTER_OPTIONS} value={filter} onChange={setFilter} accessibilityLabel="Task filter" />
    </Section>
  );
}

export function CheckRingSection() {
  const [done, setDone] = useState<ReadonlySet<ActivityHue>>(new Set([ActivityHue.PINE, ActivityHue.SKY]));
  const toggle = (hue: ActivityHue) => {
    const next = new Set(done);
    if (next.has(hue)) next.delete(hue);
    else next.add(hue);
    setDone(next);
  };
  return (
    <Section title="Check rings" description="Drawn in the activity's hue; filled when done. Tap to toggle.">
      <View className="flex-row flex-wrap gap-4">
        {Object.values(ActivityHue).map((hue) => (
          <CheckRing
            key={hue}
            hue={hue}
            checked={done.has(hue)}
            onPress={() => toggle(hue)}
            accessibilityLabel={`${done.has(hue) ? 'Mark not done' : 'Complete'}: ${hue}`}
          />
        ))}
      </View>
    </Section>
  );
}

export function CapsuleSection() {
  return (
    <Section title="Capsules" description="Upcoming, active (now) and done. Display only.">
      <View
        pointerEvents="none"
        accessible
        accessibilityLabel="Capsule specimens, display only: upcoming, active and done"
        className="flex-row items-start gap-6"
      >
        <View className="items-center gap-2">
          <Capsule hue={ActivityHue.CLAY} height={72} accessibilityLabel="Upcoming capsule">
            <Icon name="laptop" size={22} colorClassName="text-on-hue" />
          </Capsule>
          <Text className="type-meta text-ink-subtle">upcoming</Text>
        </View>
        <View className="items-center gap-2">
          <Capsule hue={ActivityHue.SKY} state={CapsuleState.ACTIVE} height={72} accessibilityLabel="Active capsule">
            <Icon name="video" size={22} colorClassName="text-on-hue" />
          </Capsule>
          <Text className="type-meta text-ink-subtle">active</Text>
        </View>
        <View className="items-center gap-2">
          <Capsule hue={ActivityHue.SAGE} state={CapsuleState.DONE} accessibilityLabel="Done capsule">
            <Icon name="run" size={22} colorClassName="text-on-hue" />
          </Capsule>
          <Text className="type-meta text-ink-subtle">done</Text>
        </View>
      </View>
    </Section>
  );
}
