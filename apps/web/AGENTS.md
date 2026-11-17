<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Daycraft web

This is **Daycraft for the web**: the desktop and tablet app (Next.js 16 App Router, React 19, Tailwind CSS v4). Daycraft is a calm personal planner whose center is the **Today timeline**. The iPhone/Android app is `apps/mobile` in the same monorepo; it shares the product, design tokens and vocabulary. Root rules: [../../AGENTS.md](../../AGENTS.md).

> Do not edit inside the `BEGIN:nextjs-*` / `END:nextjs-*` markers. `next dev` manages those blocks (`agentRules`, and `agentFeedback` because `experimental.agentFeedback` is on). Write everything else outside them.

## Daycraft in one minute

- **What it is:** a vertical day made of colored **capsules** (activities) on a spine. Tasks, events, habits, routines, goals, projects, focus and journal feed the timeline. See [product overview](docs/product/product-overview.md).
- **What it must feel like:** minimal, warm, readable, precise. Terracotta accent, warm neutrals, hairlines, almost no shadows. Color belongs to the user's activities, not to chrome.
- **Where the design lives:**
  - Tokens: values in `packages/design-tokens`, generated into the CSS that `src/app/globals.css` imports. Names and rules: the root [design system](../../docs/design/design-system.md); shared component spec: root [components](../../docs/design/components.md). Everything renders at `/design-system`.
  - Desktop prototype: “Daycraft” design canvas, page **v2 · Current**, boards “Desktop 1440”, “Tablet 768”, “Large desktop 1920”.
  - **Exported for you:** [docs/design/reference/](../../docs/design/reference/README.md) has screenshots (desktop 1440/768/1920, all phone screens in both themes) and a runnable offline prototype (`prototype/desktop-dark.html`). Look at the screenshot before building a screen.
- **What exists in code today:** Daycraft tokens, Plus Jakarta Sans, the theme switch, the component classes and the `/design-system` page; screens are placeholders. The live list is [status-and-decisions](docs/status-and-decisions.md#implementation-status).

## Non-negotiables

1. **Tokens only.** Colors, type, radii, spacing and motion come from the Daycraft tokens. No hex values, no arbitrary values (`text-[13px]`, `rounded-[10px]`, `bg-[#…]`), no Tailwind palette colors (`zinc-*`, `gray-*`), no new radii. If a token is missing, add it to `globals.css` and the docs. See [design system](docs/design/design-system.md).
2. **Both themes, always.** Use semantic classes (`bg-surface`, `text-ink-muted`, …). Never ship a light-only color. See [theming](docs/design/theming.md).
3. **Reuse before you build.** Check `src/components/ui/` and [components](docs/design/components.md) first. Extend a component with props; do not fork it.
4. **Server first.** Components are Server Components unless they need state, effects, event handlers or browser APIs. With `cacheComponents` on, uncached or dynamic data must sit under `<Suspense>` or use `"use cache"`. See [architecture](docs/development/architecture.md).
5. **The timeline is precious.** Follow the [timeline guide](docs/product/timeline-guide.md) exactly. Label any new behavior as a proposal and get it approved before building it.
6. **Smallest correct change.** No rewrites of working code, no speculative abstractions, no new dependencies without a written reason.
7. **Never claim a check you did not run.** See [testing](docs/development/testing.md).

## Workflow for every task

1. Understand the request. Read the issue in the root `.scratch/<feature-slug>/` if one exists.
2. Read the guide(s) for the area and look at the matching prototype board.
3. Read the bundled Next.js docs (`node_modules/next/dist/docs/`) for any Next API you touch.
4. Inspect existing code: routes in `src/app/`, components in `src/components/ui/`, tokens in `src/app/globals.css`.
5. Plan the smallest change that fits the architecture. Implement it, keeping domain logic in `src/domain/`.
6. Verify:
   - light and dark;
   - 1440 and 768 widths (plus 1920 for layout work);
   - keyboard navigation and focus;
   - no console errors.
7. Run `bun run check-types` and `bun run lint`. Also run `bun run build` for routing, caching or config changes. Report the real results.
8. If you changed an established pattern or token, update the matching doc in the same change.

## Guides

| Area | Read |
|---|---|
| Product, modules, vocabulary | [product-overview](docs/product/product-overview.md) · [navigation-and-modules](docs/product/navigation-and-modules.md) |
| Today timeline (most important) | [timeline-guide](docs/product/timeline-guide.md) |
| Panels, toasts, editing, completion, focus | [interaction-patterns](docs/product/interaction-patterns.md) |
| Tokens: color, radius, shadow, motion, focus | [design-system](docs/design/design-system.md) |
| Type scale and fonts | [typography](docs/design/typography.md) |
| Spacing, sizes, layout | [spacing-and-layout](docs/design/spacing-and-layout.md) |
| Component specs | [components](docs/design/components.md) |
| Light/dark implementation | [theming](docs/design/theming.md) |
| Breakpoints, rail, container queries | [responsive-design](docs/design/responsive-design.md) |
| Accessibility | [accessibility](docs/design/accessibility.md) |
| Stack, rendering, state, data, dates | [architecture](docs/development/architecture.md) |
| Folders and naming | [project-structure](docs/development/project-structure.md) |
| Code style | [coding-conventions](docs/development/coding-conventions.md) |
| Checks and tests | [testing](docs/development/testing.md) |
| Known gaps, discrepancies, open decisions | [status-and-decisions](docs/status-and-decisions.md) |

## Commands

This app is the `@daycraft/web` workspace in the Daycraft Turborepo (`apps/web`). The monorepo uses **bun** (one `bun.lock` at the root). `npx` refuses to run here because the root `package.json` declares bun in `devEngines`, so use `bunx`. Run these inside `apps/web`:

```bash
bun run dev           # next dev (also refreshes the managed AGENTS.md blocks)
bun run build         # production build: catches Cache Components / prerender errors
bun run lint          # eslint (eslint-config-next core-web-vitals + typescript)
bun run check-types   # next typegen && tsc --noEmit
bun add <pkg>         # only with a written reason (see coding-conventions)
```

From the repo root, `bunx turbo run build check-types lint` checks every workspace with caching.

## Agent skills and shared docs

Configured once at the monorepo root; see the root [`AGENTS.md`](../../AGENTS.md#agent-skills). Issues live in the root `.scratch/`, the vocabulary is the root [`GLOSSARY.md`](../../GLOSSARY.md) (use those exact terms), and ADRs go in the root `docs/adr/`. The cross-app architecture plan is [docs/architecture-plan.md](../../docs/architecture-plan.md).

## Keeping these docs true

- New reusable UI patterns must follow the design system and be added to [components](docs/design/components.md).
- Token changes go in `packages/design-tokens` (both apps follow; never edit the generated CSS). Update the root [design system](../../docs/design/design-system.md) when a name or rule is new.
- Product docs (`docs/product/`) have a mobile counterpart in `apps/mobile/docs/product/` with platform-specific differences. When the product changes, update both.
- New architectural conventions go in [architecture](docs/development/architecture.md), with an ADR in the root `docs/adr/` for real decisions.
- Never silently introduce a conflicting convention. Preserve existing behavior unless the task explicitly asks to change it.
