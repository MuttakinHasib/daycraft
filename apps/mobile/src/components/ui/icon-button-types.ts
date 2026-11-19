import type { IconName } from '@daycraft/domain';

export const IconButtonSize = {
  /** 32: dense rows, such as the editor's day arrows. */
  SM: 'sm',
  /** 44: steppers. */
  LG: 'lg',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type IconButtonSize = (typeof IconButtonSize)[keyof typeof IconButtonSize];

export interface IconButtonProps {
  icon: IconName;
  /** Required: the button has no visible text. */
  accessibilityLabel: string;
  onPress: () => void;
  size?: IconButtonSize;
  /** `surface` instead of `sunken`, for a button that sits on a sunken track. */
  onSunken?: boolean;
}
