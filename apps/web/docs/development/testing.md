# Testing and quality checks

## Checks that exist today

| Check | Command | Status (2026-11-17) |
|---|---|---|
| Typecheck | `bun run check-types` (`next typegen && tsc --noEmit`) | passes |
| Lint | `bun run lint` | passes |
| Build | `bun run build` | run for any route, data, caching or config change: it catches Cache Components and prerender errors that typecheck and lint do not |

**Run typecheck and lint before calling any task done** (and build when relevant). Report the actual output.

- A failure caused by your change must be fixed.
- A pre-existing failure must be stated explicitly.
- **Never claim tests passed without running them.**

## Tests (not set up yet)

There is no test runner. The first task that adds domain logic (the timeline layout is the obvious one) should add it:

| Layer | Tool (proposed) | What |
|---|---|---|
| Domain (`packages/domain/src/`) | Vitest | Timeline layout (push-down, the 12px gap, anchors and time map, hour-label hiding, gap detection); snapping and clamping; next free slot; streaks and weekly counts; progress; date utilities (Sunday week start, no UTC parsing, DST-safe day math); formatting; validation |
| Components | Vitest + Testing Library (jsdom) | Client components' roles and states (`aria-pressed`, `aria-checked`, `aria-current`), keyboard behavior of the segmented control and dialog, toast announcements |
| End-to-end | Playwright + `@axe-core/playwright` | Critical flows ([product-overview](../product/product-overview.md#key-user-workflows)) at 1440 and 768, light and dark: create task from a slot, rename in the panel, complete, drag to move and resize (with the keyboard alternative), habit check-in, date navigation, theme switch, focus start and end. axe scan on every page. |

Add a `test` (and `e2e`) script in `package.json` and update this file when you do. Check the bundled Next.js docs for their current testing guides first.

Rules once tests exist:

- Domain logic ships with unit tests.
- Bug fixes start with a failing test.
- Tests inject a fixed clock (fixtures: Tue, Nov 17, 2026, 10:40 AM).
- Test names use the [vocabulary](../product/product-overview.md#vocabulary).

## Manual verification (every UI change)

1. **Themes:** light and dark, including before hydration (no flash).
2. **Widths:** 768, 1024, 1440, 1920; 375 must not overflow horizontally.
3. **Keyboard:** tab order, visible focus, Escape and Enter behavior, no keyboard traps.
4. **Screen reader spot check:** names and roles of new controls (VoiceOver or NVDA).
5. **Reduced motion:** with `prefers-reduced-motion` on, nothing slides or pops.
6. **Console:** no hydration warnings or errors (watch now-dependent UI).
7. **Timeline changes:**
   - 5-minute snapping;
   - a click still selects (no accidental drag);
   - the grip resizes without moving;
   - the now line stays visible through the selected-row tint;
   - hour labels and gap hints never overlap blocks.

If you cannot run a browser in your environment, say so and list exactly what is unverified.
