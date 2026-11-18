/** Cubic-bezier control points; `ease-snap` is for sheets, toasts and anything entering. */
export const easing = {
  snap: [0.2, 0.9, 0.25, 1],
} as const;

/** Durations in milliseconds. */
export const durations = {
  sheetUp: 340,
  fadeIn: 220,
  toastIn: 280,
  pop: 700,
  press: 140,
  reflow: 220,
  progress: 500,
  theme: 300,
} as const;

/** Scale keyframes for `pop`: check marks, new capsules, the focus-complete badge. */
export const popScale = [0.6, 1.12, 1] as const;

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

/** Springs, shared by both platforms: Reanimated takes them directly, CSS gets `springToCssEasing`. */
export const springs = {
  /**
   * Selections that glide into place, such as the segmented control's pill. Motion's formula for
   * visualDuration 0.35s, bounce 0.1 (damping ratio 0.9): no visible overshoot.
   */
  snap: { stiffness: 224, damping: 27, mass: 1 },
} as const satisfies Record<string, SpringConfig>;

export interface CssSpring {
  /** A `linear()` easing that traces the spring from 0 to 1. */
  easing: string;
  /** How long the spring takes to settle, in milliseconds. */
  durationMs: number;
}

/** Simulates the spring and samples it, so CSS transitions move like the native animation. */
export function springToCssEasing(spring: SpringConfig): CssSpring {
  const step = 1 / 1000;
  const positions = [0];
  let position = 0;
  let velocity = 0;
  while (positions.length < 5000) {
    const force = -spring.stiffness * (position - 1) - spring.damping * velocity;
    velocity += (force / spring.mass) * step;
    position += velocity * step;
    positions.push(position);
    if (Math.abs(position - 1) < 0.001 && Math.abs(velocity) < 0.01) break;
  }
  const samples = 60;
  const points = Array.from({ length: samples + 1 }, (_, index) => {
    const value = positions[Math.round((index / samples) * (positions.length - 1))] ?? 1;
    return Number(value.toFixed(4));
  });
  points[samples] = 1;
  return { easing: `linear(${points.join(', ')})`, durationMs: positions.length - 1 };
}
