import { Text, View } from 'react-native';

import { IconButton } from '@/components/ui';

import { WHEEL_HEIGHT, type WheelColumn, type WheelProps } from './wheel-types';

interface StepperColumnProps {
  column: WheelColumn;
}

// Off iOS there is no native wheel; each column steps through its options instead.
function StepperColumn({ column }: StepperColumnProps) {
  const index = Math.max(
    0,
    column.options.findIndex((option) => option.value === column.value),
  );
  const step = (delta: number) => {
    const next = column.options[(index + delta + column.options.length) % column.options.length];
    if (next) column.onChange(next.value);
  };
  return (
    <View className="flex-1 items-center gap-2">
      <IconButton icon="plus" accessibilityLabel={`Next ${column.label}`} onPress={() => step(1)} />
      <Text style={{ fontVariant: ['tabular-nums'] }} className="type-heading text-ink">
        {column.options[index]?.label ?? ''}
      </Text>
      <IconButton icon="minus" accessibilityLabel={`Previous ${column.label}`} onPress={() => step(-1)} />
    </View>
  );
}

/** Steppers standing in for picker wheels where the platform has none. */
export function Wheel({ columns, accessibilityLabel }: WheelProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={{ height: WHEEL_HEIGHT }} className="flex-row items-center">
      {columns.map((column) => (
        <StepperColumn key={column.key} column={column} />
      ))}
    </View>
  );
}
