import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useCSSVariable } from 'uniwind';

import { ActivityHue } from '@daycraft/domain';

import { cn } from '@/lib/cn';

import { ActivityHueBackground } from './hues';

interface CapsuleProps {
  hue?: ActivityHue;
  state?: 'idle' | 'active' | 'done';
  height?: number;
  onPress?: () => void;
  children?: ReactNode;
}

function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function Capsule({ hue = ActivityHue.SAGE, state = 'idle', height, onPress, children }: CapsuleProps) {
  const hueHex = useCSSVariable(`--color-${hue}`) as string | undefined;

  return (
    <Pressable
      accessibilityRole="button"
      data-state={state}
      onPress={onPress}
      className="relative data-[state=done]:opacity-45"
    >
      {state === 'active' && typeof hueHex === 'string' && hueHex.startsWith('#') && (
        <View
          className="absolute -inset-1 rounded-capsule"
          style={{ borderWidth: 4, borderColor: withAlpha(hueHex, 0.28) }}
        />
      )}
      <View
        style={height ? { height } : undefined}
        className={cn(
          'flex w-12 min-h-12 items-center justify-center overflow-hidden rounded-capsule',
          ActivityHueBackground[hue],
        )}
      >
        {children}
      </View>
    </Pressable>
  );
}
