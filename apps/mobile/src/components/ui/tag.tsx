import type { IconName } from '@daycraft/domain';
import { Text, View } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon } from './icon';

export const TagTone = {
  /** `sunken` with `ink-muted` text. */
  NEUTRAL: 'neutral',
  /** `accent-soft` with `accent-text` and an accent dot, such as "Now · 50m left". */
  NOW: 'now',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type TagTone = (typeof TagTone)[keyof typeof TagTone];

interface TagProps {
  icon?: IconName;
  /** A small icon after the text, such as the chevron on a subtask count. */
  trailingIcon?: IconName;
  tone?: TagTone;
  children: string;
}

export function Tag({ icon, trailingIcon, tone = TagTone.NEUTRAL, children }: TagProps) {
  const now = tone === TagTone.NOW;
  const color = cn({ 'text-ink-muted': !now, 'text-accent-text': now });
  return (
    <View
      className={cn('h-6 shrink flex-row items-center gap-1 self-start rounded-full px-2', {
        'bg-sunken': !now,
        'bg-accent-soft': now,
      })}
    >
      {now && <View className="size-1.5 rounded-full bg-accent" />}
      {icon && <Icon name={icon} size={12} colorClassName={color} />}
      <Text
        numberOfLines={1}
        style={{ fontVariant: ['tabular-nums'] }}
        className={cn('shrink type-meta font-sans-semibold', color)}
      >
        {children}
      </Text>
      {trailingIcon && <Icon name={trailingIcon} size={11} colorClassName={color} />}
    </View>
  );
}
