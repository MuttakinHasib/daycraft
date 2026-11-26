import { type ActivityHue, type IconName } from '@daycraft/domain';
import { Text, View } from 'react-native';

import { CheckRing, colorValue, Icon, inkClassOn } from '@/components/ui';
import { cn } from '@/lib/cn';

// The Habits step (onboarding doc §2): eight daily preset rows, at most four picked, with the picked ones
// filling the sheet's habit strip above the timeline. There is no + here: presets are the only way to pick,
// and a preset the person already has (Replay) shows ticked and inert under an "Added" note.

interface Preset {
  title: string;
  icon: IconName;
  hue: ActivityHue;
}

interface PresetRowProps {
  preset: Preset;
  owned: boolean;
  picked: boolean;
  dimmed: boolean;
  onToggle: () => void;
}

function PresetRow({ preset, owned, picked, dimmed, onToggle }: PresetRowProps) {
  const disabled = owned || (dimmed && !picked);
  return (
    <View
      className={cn('flex-row items-center gap-3 rounded-card bg-card p-3', {
        'opacity-50': disabled,
      })}
    >
      <View
        style={{ backgroundColor: colorValue(preset.hue) }}
        className="size-8 items-center justify-center rounded-full"
      >
        <Icon name={preset.icon} size={16} colorClassName={inkClassOn(preset.hue)} />
      </View>
      <Text className="flex-1 type-body font-sans-medium text-ink">{preset.title}</Text>
      {owned ? (
        <Text className="type-control text-ink-muted">Added</Text>
      ) : (
        <CheckRing
          checked={picked}
          hue={preset.hue}
          accessibilityLabel={picked ? `Remove habit: ${preset.title}` : `Add habit: ${preset.title}`}
          onPress={onToggle}
        />
      )}
    </View>
  );
}

interface HabitsStepProps {
  presets: readonly Preset[];
  /** The preset titles already a habit on Replay: shown ticked and inert. */
  owned: readonly string[];
  picked: readonly string[];
  capReached: boolean;
  onToggle: (title: string) => void;
}

export function HabitsStep({ presets, owned, picked, capReached, onToggle }: HabitsStepProps) {
  const ownedTitles = presets.filter((preset) => owned.includes(preset.title)).map((preset) => preset.title);
  return (
    <View className="gap-2 px-5">
      {presets.map((preset) => (
        <PresetRow
          key={preset.title}
          preset={preset}
          owned={ownedTitles.includes(preset.title)}
          picked={picked.includes(preset.title)}
          dimmed={capReached}
          onToggle={() => onToggle(preset.title)}
        />
      ))}
    </View>
  );
}
