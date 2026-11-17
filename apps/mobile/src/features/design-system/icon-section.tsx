import { ACTIVITY_ICONS, INTERFACE_ICONS, MOOD_ICONS, type IconName } from '@daycraft/domain';
import { Text, View } from 'react-native';

import { Icon } from '@/components/ui';

import { Section } from './section';

interface IconGroupProps {
  title: string;
  names: readonly IconName[];
}

function IconGroup({ title, names }: IconGroupProps) {
  return (
    <View className="gap-2">
      <Text className="type-control text-ink-muted">{`${title} (${names.length})`}</Text>
      <View className="flex-row flex-wrap gap-2">
        {names.map((name) => (
          <View key={name} className="w-16 items-center gap-1 rounded-tile bg-sunken py-2">
            <Icon name={name} size={22} colorClassName="text-ink" />
            <Text className="type-micro text-ink-muted" numberOfLines={1}>
              {name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function IconSection() {
  return (
    <Section title="Icons" description="Lucide at stroke 1.9, with the prototype's own moods, run and timeline.">
      <IconGroup title="Activity" names={ACTIVITY_ICONS} />
      <IconGroup title="Interface" names={INTERFACE_ICONS} />
      <IconGroup title="Mood" names={MOOD_ICONS} />
    </Section>
  );
}
