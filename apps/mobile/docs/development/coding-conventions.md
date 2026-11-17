# Coding conventions

## General

- Straightforward code over clever code. Write the obvious version first. Abstract on the **third** real repetition, not the first.
- Small, focused components, but no fragmentation. A 15-line piece used once stays inline. Extract when it has its own state, its own name in the design (Capsule, WeekStrip), or a second caller.
- Business logic goes in `packages/domain/src/` (pure) or a feature hook, never inline in JSX.
- Do not duplicate logic across screens. Plan, All tasks and Upcoming all read activities through the same hook and format time through `packages/domain/src/time.ts`.
- No dead code, commented-out code, or template leftovers in files you touch.
- Comments explain **why** (constraints, platform quirks), not what. The existing `// Complete string literals only: Tailwind scans at build time` is the model.

## TypeScript

- `strict` is on. No `any`. Use `unknown` and narrow it.
- No non-null `!` except where the type system cannot know (document why).
- Explicit return types on exported domain functions.
- Discriminated unions for variants and results (`{ ok: true } | { ok: false; reason }`, `kind: 'task' | 'event' | 'routine'`).
- Parameters and enum-likes follow the root [code rules](../../../../AGENTS.md#code-rules-every-workspace): at most two positional parameters, otherwise one object parameter typed by a named type at the top of the file (`findNextFreeSlot(input: FindNextFreeSlotInput)`); const objects instead of `enum`.
- IDs are opaque strings. Do not encode meaning in them.

## React / React Native

- Function components only. Named exports.
- Props interfaces: optional props have defaults in the destructuring (`variant = 'primary'`).
- Required accessibility props are required in the type (`accessibilityLabel` on icon buttons).
- **Conditional rendering:**
  - Use early returns and `&&` for one condition.
  - For several states, map them to a variable or a small lookup object before the JSX.
  - Never nest ternaries in JSX; avoid ternary chains anywhere.
- Avoid deeply nested JSX: extract a named subcomponent when nesting passes about 4 levels of layout views.
- Keys: stable IDs, never array indexes for lists that can reorder.
- The React Compiler memoizes, so do not add `useMemo`/`useCallback`/`memo` unless profiling shows a need or identity matters (gesture handlers, effects).
- Effects only for synchronizing with things outside React (timers, subscriptions). Derive values during render instead of syncing them with effects.

## Styling with Uniwind

- Style with `className`. `StyleSheet.create` is for values classes cannot express. Inline `style` is only for **computed** values (timeline `top`/`height`, progress widths, gesture transforms).
- Only token classes (see [design-system](../design/design-system.md)). No arbitrary values (`text-[13px]`, `rounded-[10px]`, `#fff`). If you need one, the token is missing: add it to `global.css` and the docs.
- **Never build class names dynamically** (``bg-${hue}``). Use literal maps like `ActivityHueBackground`.
- Combine and toggle classes with `cn` from `@/lib/cn` in object notation ([rule](../../../../docs/agents/rules/cn-object-notation.md)). When you add a font-size, radius, font-family or `type-*` token, add its name to `@/lib/cn` too.
- State styling through `data-*` attributes and `data-[key=value]:` variants (equality only), plus `active:`, `disabled:`, `focus:`.
- Each primitive owns all of its classes; there is no CSS component layer in `global.css` (it only imports the generated tokens). Repeated multi-property styles become a primitive, not a CSS class.
- Third-party components without `className`: wrap them with `withUniwind`.
- Remember RN layout defaults: flex column, no CSS inheritance (set the font family and color on every `Text`, or use the presets), limited units (no `em`, few percentages).
- Platform differences: `ios:`, `android:`, `native:`, `web:` variants before platform files.

## Imports

- Use the `@/` alias for anything outside the current folder; use relative imports within a folder (as `components/ui` does).
- Order (VS Code organizes on save): external packages, blank line, `@/` imports, blank line, relative imports, side-effect imports (`'@/global.css'`) last in the root layout.
- Import primitives from `@/components/ui`.

## Dependencies

- Add with `bunx expo install <pkg>`, run inside `apps/mobile`.
- Every new dependency needs a reason in the issue or PR: what it replaces, why the standard library or Expo modules are not enough, and that it supports the New Architecture and SDK 58.
- Prefer Expo modules. Native modules require a development build: note this in the PR.

## Git and issues

- Small commits, one-line titles per the [commit conventions](../../../../docs/agents/rules/commit-conventions.md) (“Add Daycraft UI primitives”).
- Work from the root `.scratch/<feature>/` issues when they exist (root `docs/agents/issue-tracker.md`). Update the issue's `Status:` line.
