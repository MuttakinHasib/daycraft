import type { IconName } from '@daycraft/domain';

/** One button in a group: an icon with a spoken label, or a short text label. */
export type GroupButton =
  { icon: IconName; accessibilityLabel: string; onPress: () => void } | { label: string; onPress: () => void };

export interface ButtonGroupProps {
  buttons: GroupButton[];
}
