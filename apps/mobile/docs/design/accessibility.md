# Accessibility

Daycraft is used every day, for long periods, by people who plan carefully. Accessibility is part of “done”.

## Semantics (React Native)

- Every pressable has an `accessibilityRole`:
  - `button`;
  - `checkbox` (check rings, subtasks, milestones);
  - `tab` (segmented buttons, tab bar);
  - `link`;
  - `adjustable` (steppers, if implemented as one control).
- Toggles set `accessibilityState` (`checked` / `selected` / `disabled` / `expanded`). The existing primitives already do this. Keep it when extending them.
- Icon-only controls require an `accessibilityLabel` (“Close”, “Previous week”, “Add a habit”, “New task”). Make the prop required in their TypeScript types.
- Labels describe the result, not the shape:
  - Check rings: “Complete: Write Q4 roadmap draft” / “Mark not done: …”.
  - Habit circles: “Read, done” / “Read, not done yet”.
  - Capsules: see [timeline-guide](../product/timeline-guide.md#14-accessibility).
- Decorative icons and illustrations: `accessible={false}` / `importantForAccessibility="no"`.
- Group related text so VoiceOver reads a card as one element when that is clearer (`accessible` on the container + a combined label). Do not do this for cards that contain separate buttons.
- Headings: screen titles get `accessibilityRole="header"`.

## Touch targets

- Minimum **44×44pt**.
- Smaller visuals (24pt check ring, 32pt chips, 16pt favicon-size icons) extend with `hitSlop` to 44. The check ring uses `hitSlop` 10 at 24pt.
- Keep 8pt between adjacent targets.

## Color and contrast

- Text ≥ 4.5:1; large text (≥ 18pt, or ≥ 14pt bold) and essential icons ≥ 3:1. The token pairs in [design-system](design-system.md#semantic-colors) were checked. Do not create new text/background pairs without checking them.
- Never use color alone:
  - Done = strikethrough + filled ring.
  - Event vs task = tag text + tint.
  - Priority = flag icon + word.
  - Active = “Now · 50m left” text.

## Drag-and-drop alternatives (required)

Everything you can do by dragging can also be done without dragging:

- **Reschedule:** the editor's −15 / +15 stepper and date stepping.
- **Resize:** the editor's duration segments.
- Kanban moves use explicit buttons (Start →, Done →, Reopen →), not drag.
- **Proposed:** `accessibilityActions` on capsules for ±15 min move/extend.

## Motion

- Honor Reduce Motion (`useReducedMotion` from Reanimated, or `AccessibilityInfo.isReduceMotionEnabled`):
  - sheets fade instead of sliding;
  - no pop or scale effects;
  - timeline reflow is instant;
  - progress rings jump to their value.
- No autoplaying or looping animation, except the focus timer's progress, which reflects real time.

## Screen readers

- Toasts announce politely.
- Timer: the focus ring container has a timer label (“24 minutes 12 seconds remaining”). Announce state changes (started, paused, complete), not every second.
- After saving a sheet, focus returns to the element that opened it, or to the new or edited item when feasible.
- The timeline should be readable in reading order: date header → habits → activities in time order. Make sure absolute positioning does not scramble the order; render rows in sorted order.

## Text

- Support Dynamic Type (no `allowFontScaling={false}` except the 56pt focus clock, which still scales up to a cap).
- No text in images.

## Disabled and loading

- Disabled: 50% opacity, `accessibilityState.disabled`, explain why nearby if it is not obvious.
- Loading: keep the control's size, add `accessibilityState={{ busy: true }}`.

## Keyboard (iPad and web)

- Logical focus order.
- Visible focus.
- Enter submits single-line capture fields (Inbox, subtasks, routine steps, project tasks).
- Escape closes sheets on web.
