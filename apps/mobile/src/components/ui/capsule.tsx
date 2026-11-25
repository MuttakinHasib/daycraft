import { hueTints, inkOn, withOpacity } from '@daycraft/design-tokens';
import { ActivityHue, type ActivityColor } from '@daycraft/domain';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';

import { colorValue } from './activity-color';

export const CapsuleState = {
  IDLE: 'idle',
  ACTIVE: 'active',
  DONE: 'done',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type CapsuleState = (typeof CapsuleState)[keyof typeof CapsuleState];

// The active capsule's base is the hue at this strength over the panel, as `color-mix(hue 42%, surface)`.
const ACTIVE_BASE_OPACITY = 0.42;

/** What screen readers can do to the capsule besides tapping it: its accessibility actions. */
export type CapsuleAccessibilityProps = Pick<
  ComponentProps<typeof Pressable>,
  'accessibilityActions' | 'onAccessibilityAction'
>;

interface CapsuleProps extends CapsuleAccessibilityProps {
  hue?: ActivityColor;
  state?: CapsuleState;
  height?: number;
  /** For an active capsule, how much has passed (0–1): that part, from the top, is the solid hue. */
  elapsed?: number;
  /** Shows the resize grip: a 16×3 bar at the bottom (activities of 15 minutes or more). */
  grip?: boolean;
  onPress?: () => void;
  /** "Deep work · Onboarding flow, 9:30–11:30 AM. Drag to move, drag the bottom grip to resize." */
  accessibilityLabel: string;
  children?: ReactNode;
}

export function Capsule({
  hue = ActivityHue.SAGE,
  state = CapsuleState.IDLE,
  height,
  elapsed = 0,
  grip = false,
  onPress,
  accessibilityLabel,
  accessibilityActions,
  onAccessibilityAction,
  children,
}: CapsuleProps) {
  const active = state === CapsuleState.ACTIVE;
  const color = colorValue(hue);
  const lightColor = inkOn(color) === 'ink';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={onAccessibilityAction}
      data-state={state}
      onPress={onPress}
      className="relative data-[state=done]:opacity-45"
    >
      {active && (
        // A filled pill behind the capsule, not a border, so the ring stays concentric at any height.
        <View
          className="absolute -inset-1 rounded-full"
          style={{ backgroundColor: withOpacity(color, hueTints.activeRing) }}
        />
      )}
      <View
        // Solid hue; icons inside use `inkClassOn` (white, or dark on a light custom color).
        style={{ height, backgroundColor: active ? undefined : color }}
        className={cn('flex w-12 min-h-12 items-center justify-center overflow-hidden rounded-capsule', {
          'bg-surface': active,
        })}
      >
        {active && (
          <>
            <View className="absolute inset-0" style={{ backgroundColor: withOpacity(color, ACTIVE_BASE_OPACITY) }} />
            <View
              className="absolute inset-x-0 top-0"
              style={{ height: `${Math.min(1, Math.max(0, elapsed)) * 100}%`, backgroundColor: color }}
            />
          </>
        )}
        {children}
        {grip && (
          <View pointerEvents="none" className="absolute inset-x-0 bottom-0 h-4.5 items-center justify-center">
            <View
              className={cn('h-0.75 w-4 rounded-full opacity-75', { 'bg-on-hue': !lightColor, 'bg-ink': lightColor })}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
}
