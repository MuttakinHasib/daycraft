import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { hueColors, withOpacity } from '@daycraft/design-tokens';
import { ActivityHue } from '@daycraft/domain';

import { cn } from '@/lib/cn';

import { ActivityHueBackground } from './hues';

export const CapsuleState = {
  IDLE: 'idle',
  ACTIVE: 'active',
  DONE: 'done',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type CapsuleState = (typeof CapsuleState)[keyof typeof CapsuleState];

interface CapsuleProps {
  hue?: ActivityHue;
  state?: CapsuleState;
  height?: number;
  onPress?: () => void;
  /** "Deep work · Onboarding flow, 9:30–11:30 AM. Drag to move, drag the bottom grip to resize." */
  accessibilityLabel: string;
  children?: ReactNode;
}

export function Capsule({
  hue = ActivityHue.SAGE,
  state = CapsuleState.IDLE,
  height,
  onPress,
  accessibilityLabel,
  children,
}: CapsuleProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      data-state={state}
      onPress={onPress}
      className="relative data-[state=done]:opacity-45"
    >
      {state === CapsuleState.ACTIVE && (
        // A filled pill behind the capsule, not a border, so the ring stays concentric at any height.
        <View
          className="absolute -inset-1 rounded-full"
          style={{ backgroundColor: withOpacity(hueColors[hue], 0.28) }}
        />
      )}
      <View
        // Solid hue; icons inside use text-on-hue (white).
        style={height ? { height } : undefined}
        className={cn('flex w-12 min-h-12 items-center justify-center overflow-hidden rounded-capsule', ActivityHueBackground[hue])}
      >
        {children}
      </View>
    </Pressable>
  );
}
