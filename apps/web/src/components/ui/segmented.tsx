"use client";

import type { CSSProperties } from "react";

interface SegmentedOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface SegmentedProps<TValue extends string> {
  options: readonly SegmentedOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  /** Names the group for screen readers, e.g. "Task filter". */
  label: string;
}

interface SegmentedStyle extends CSSProperties {
  "--segment-count": number;
  "--segment-index": number;
}

/** A segmented control. It takes the options and the selected value and reports a new value through `onChange`. The selection springs between options. */
export function Segmented<TValue extends string>({ options, value, onChange, label }: SegmentedProps<TValue>) {
  const style: SegmentedStyle = {
    "--segment-count": options.length,
    "--segment-index": Math.max(
      0,
      options.findIndex((option) => option.value === value),
    ),
  };
  return (
    <div className="segmented" role="group" aria-label={label} style={style}>
      <span className="segmented-indicator" aria-hidden="true" />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
