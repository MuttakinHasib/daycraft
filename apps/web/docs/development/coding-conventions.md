# Coding conventions

## General

- Straightforward over clever. Abstract on the third real repetition.
- Focused components without fragmentation. Extract a component when it has its own state, its own name in the design (WeekStrip, Capsule, DetailPanel), or a second caller.
- Business logic in `packages/domain/src/` (pure) or a feature hook, never inline in JSX.
- Do not duplicate logic across screens. One formatter, one layout function, one next-free-slot.
- No dead code, no commented-out code, and no leftover template code in files you touch (the starter page, Geist, `zinc-*` classes).
- Comments explain why, not what.

## TypeScript

- `strict`, no `any`. Use `unknown` and narrow it.
- Avoid `as` casts. Validate external data at the boundary.
- Explicit return types on exported domain functions.
- Discriminated unions for variants and results.
- Parameters and enum-likes follow the root [code rules](../../../../AGENTS.md#code-rules-every-workspace): at most two positional parameters, otherwise one object parameter typed by a named type at the top of the file; const objects instead of `enum`.
- Use the generated route types (`PageProps`, `LayoutProps`) instead of hand-typing `params` / `searchParams`.

## React and Next.js

- Server Components by default; `"use client"` at the leaf. See [architecture](architecture.md#server-and-client-components).
- **Conditional rendering:**
  - Early returns and `&&` for one condition.
  - For several states, compute a variable or a lookup object before the JSX.
  - **No nested ternaries.**
- Avoid JSX nested more than about 4 layout levels deep: extract a named piece.
- Keys are stable IDs, never indexes for reorderable lists.
- React Compiler: no reflexive `useMemo` / `useCallback` / `memo`.
- Effects only to sync with outside systems (timers, subscriptions, `matchMedia`). Derive values during render.
- Navigation through `<Link>` and URL state. Do not mirror the URL into React state.

## Styling (Tailwind v4)

- Utility classes in JSX. Shared multi-property patterns go into `@layer components` in `globals.css` (as the reference CSS does for `.capsule`, `.chip`, `.btn-primary`) or into a component. Never both.
- Token utilities only. No arbitrary values (`text-[13px]`, `bg-[#fff]`, `rounded-[10px]`), no palette colors (`zinc`, `gray`, `white`, `black`), no off-scale spacing. Need one? Add a token, document it, and sync mobile.
- Inline `style` only for computed values: timeline `top` and `height`, progress, hue CSS variables, drag transforms.
- **No dynamic class strings** (``bg-${hue}``): use literal maps.
- Combine and toggle classes with a configured `cn` (the [`cn`](https://www.npmjs.com/package/cn) package) in object notation ([rule](../../../../docs/agents/rules/cn-object-notation.md)). Web adds its configured instance when the tokens land (ticket 05); no `clsx` or `tailwind-merge`.
- State styling via ARIA and data attributes plus variants (`aria-pressed:bg-ink`, `data-[state=done]:opacity-45`), so semantics and styles stay in sync.

## Imports

- `@/` for anything outside the current folder; relative imports within a feature or component folder.
- Order: external packages, then `@/`, then relative, then styles.
- Import UI components from `@/components/ui`.

## Dependencies

- Every new dependency needs a written reason in the issue or PR: what it replaces, why the platform, Next or React built-ins are not enough, its size, and how it is maintained.
- Prefer built-ins: `Intl` for formatting, `<dialog>` for dialogs, Pointer Events for drag, `next/font`, `next/image`.

## Git and issues

- Small commits, one-line titles per the [commit conventions](../../../../docs/agents/rules/commit-conventions.md) (“Add Daycraft tokens to globals.css”).
- Commit `AGENTS.md` when `next dev` updates its managed blocks (see the block at the top of that file).
- Work from the root `.scratch/<feature-slug>/` issues (root `docs/agents/issue-tracker.md`) and update their `Status:`.
