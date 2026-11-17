# Testing and quality checks

## Checks that exist today

| Check | Command | Status (2026-11-17) |
|---|---|---|
| Typecheck | `bun run check-types` (`tsc --noEmit`) | passes |
| Lint | `bun run lint` (`expo lint`, ESLint 9, `eslint-config-expo`) | passes |
| Dependency health | `bunx expo-doctor` (3 checks error under bun: they shell out to `npm explain`) | run when you add or upgrade packages |

**Run typecheck and lint before calling any task done.** Report the actual output.

- If a check fails because of your change, fix it.
- If it fails for an unrelated pre-existing reason, say so explicitly. Do not hide it.
- **Never say tests passed if you did not run them**, and never say “should pass”.

## Tests (not set up yet)

There is no test runner in `package.json`. The first task that adds testable domain logic (the timeline layout is the obvious first one) should add:

| Layer | Tool (proposed) | What to test |
|---|---|---|
| Domain (`packages/domain/src/`) | `jest-expo` preset (Expo's documented setup) | Timeline layout: push-down, the 12pt gap, anchors and the time map, hour-label hiding, gaps (≥ 60 min and ≥ 76pt). Snapping and clamping; next free slot. Streaks and weekly counts; progress; date utilities (week start, DST-safe day math, the no-UTC-parse rule); formatting (`9:30–11:30 AM`, `1 hr 30 min`). Validation. |
| Components | `@testing-library/react-native` | Primitives' roles and states (`Chip` selected, `CheckRing` checked, `Button` disabled); editor validation keeps the sheet open; toasts appear. |
| End-to-end | Maestro (proposed; check Expo's current recommendation) | The 12 workflows in [product-overview](../product/product-overview.md#key-user-workflows). Minimum: create task, complete, edit, reschedule via the editor, habit check-in, add routine, start and end focus, switch theme. |

Add the setup with `bunx expo install`, follow the SDK 58 docs, and add a `test` script (Turborepo runs it as a task). Then update this table.

Rules once tests exist:

- New domain logic ships with unit tests.
- Bug fixes start with a failing test.
- Tests use a fixed clock (inject “now”; the fixtures use Tue, Nov 17, 2026, 10:40 AM).
- Test names use the [vocabulary](../product/product-overview.md#vocabulary).

## Manual verification (every UI change)

Before marking UI work done, check on a simulator or device and say what you checked:

1. **Both themes:** light and dark (toggle the simulator appearance or use `Uniwind.setTheme`).
2. **Sizes:** iPhone 375×812 (SE / mini class) and 390×844. Also 430×932 for layout-heavy screens.
3. **States:** empty, typical, long text, many items; pressed, disabled, selected.
4. **Accessibility:** VoiceOver reads controls with sensible labels and roles; 44pt targets; Larger Text at a big size does not clip; Reduce Motion respected.
5. **Timeline changes:**
   - drag and resize snap to 5 min;
   - taps still open detail;
   - scroll still works while dragging is armed;
   - the now line and active fill are correct;
   - free-time hints and hour labels do not overlap blocks.
6. **No regressions:** open the screens next to the one you changed.

If you cannot run a simulator in your environment, say so and list exactly what remains unverified.
