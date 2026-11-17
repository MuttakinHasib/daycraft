import type { IconName } from '@daycraft/domain';
import { Text, View } from 'react-native';

import { Icon } from './icon';

interface TagProps {
  icon?: IconName;
  children: string;
}

export function Tag({ icon, children }: TagProps) {
  return (
    <View className="h-6 shrink-0 flex-row items-center gap-1 self-start rounded-full bg-sunken px-2">
      {icon && <Icon name={icon} size={12} colorClassName="text-ink-muted" />}
      <Text className="text-xs font-sans-semibold text-ink-muted">{children}</Text>
    </View>
  );
}
