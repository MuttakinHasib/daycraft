/** The wheel's height on screen: three to five rows of the native picker. */
export const WHEEL_HEIGHT = 150;

export interface WheelOption {
  value: number;
  label: string;
}

export interface WheelColumn {
  key: string;
  /** What the column sets, for screen readers ("Hour", "Minutes"). */
  label: string;
  options: readonly WheelOption[];
  value: number;
  onChange: (value: number) => void;
}

export interface WheelProps {
  columns: WheelColumn[];
  accessibilityLabel: string;
}
