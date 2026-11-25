import {
  formatClock,
  formatDuration,
  formatRange,
  movedTiming,
  PHONE_SCALE,
  resizedTiming,
  snapMinutes,
  SNAP_MINUTES,
  type Activity,
  type DragPreview,
  type Timing,
} from '@daycraft/domain';
import { useRef, useState } from 'react';

// Drag to move and drag the grip to resize (timeline guide §10). Moves snap to 5 minutes and stay within the day;
// the preview drives the layout so other rows reflow; release commits, an interrupted gesture changes nothing.

export const DragMode = {
  MOVE: 'move',
  RESIZE: 'resize',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type DragMode = (typeof DragMode)[keyof typeof DragMode];

// A tap right after a drag must not also open the detail sheet.
const SUPPRESS_PRESS_MS = 80;

interface ActiveDrag {
  id: string;
  mode: DragMode;
  original: Timing;
  preview: Timing;
}

export interface CommittedDrag {
  id: string;
  timing: Timing;
  /** "Moved to 11:15 AM–12:15 PM" or "Now 1 hr 15 min · ends 12:45 PM". */
  message: string;
}

export interface TimelineDrag {
  /** The activity being dragged and its preview timing, for the layout. */
  preview: DragPreview | null;
  begin: (activity: Activity, mode: DragMode) => void;
  update: (deltaY: number) => void;
  end: (canceled: boolean) => void;
  /** True for a moment after a drag ends, so the release isn't also a tap. */
  isPressSuppressed: () => boolean;
}

function commitMessage(mode: DragMode, timing: Timing): string {
  if (mode === DragMode.MOVE) return `Moved to ${formatRange(timing.start, timing.durationMinutes)}`;
  return `Now ${formatDuration(timing.durationMinutes)} · ends ${formatClock(timing.start + timing.durationMinutes)}`;
}

export interface DragOptions {
  /** Minutes a drag snaps to: 5 on Plan, 15 for the day edges in onboarding. */
  step?: number;
  /** Points per minute of the timeline being dragged (onboarding fits the whole day). */
  scale?: number;
}

/** Drag state for the timeline. `onCommit` saves a finished drag. */
export function useTimelineDrag(
  onCommit: (drag: CommittedDrag) => void | Promise<void>,
  { step = SNAP_MINUTES, scale = PHONE_SCALE }: DragOptions = {},
): TimelineDrag {
  const [active, setActive] = useState<ActiveDrag | null>(null);
  // Gesture callbacks read the latest drag synchronously, between renders.
  const activeRef = useRef<ActiveDrag | null>(null);
  const suppressUntil = useRef(0);

  const set = (next: ActiveDrag | null) => {
    activeRef.current = next;
    setActive(next);
  };

  return {
    preview: active ? { id: active.id, ...active.preview } : null,

    begin(activity, mode) {
      if (activity.start === null) return;
      const original = { start: activity.start, durationMinutes: activity.durationMinutes };
      set({ id: activity.id, mode, original, preview: original });
    },

    update(deltaY) {
      const current = activeRef.current;
      if (!current) return;
      const delta = Math.round(snapMinutes(deltaY, scale) / step) * step || 0;
      const preview =
        current.mode === DragMode.MOVE ? movedTiming(current.original, delta) : resizedTiming(current.original, delta);
      if (preview.start === current.preview.start && preview.durationMinutes === current.preview.durationMinutes)
        return;
      set({ ...current, preview });
    },

    end(canceled) {
      const current = activeRef.current;
      set(null);
      suppressUntil.current = Date.now() + SUPPRESS_PRESS_MS;
      if (!current || canceled) return;
      const { original, preview } = current;
      if (preview.start === original.start && preview.durationMinutes === original.durationMinutes) return;
      onCommit({ id: current.id, timing: preview, message: commitMessage(current.mode, preview) });
    },

    isPressSuppressed: () => Date.now() < suppressUntil.current,
  };
}
