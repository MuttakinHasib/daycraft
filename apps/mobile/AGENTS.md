# Daycraft mobile

This is **Daycraft for iPhone and Android** (`apps/mobile` in the monorepo; root rules in [../../AGENTS.md](../../AGENTS.md)), an Expo/React Native app (iPhone first, Android second) for planning your day on a visual timeline. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

> Read this file first, then the guide for the area you are touching (table below). If a guide disagrees with the code, check [docs/status-and-decisions.md](docs/status-and-decisions.md) — it records every known discrepancy and which side is the source of truth.

## Daycraft in one minute

- **What it is:** a calm personal planner. Its center is the **Today timeline**, a vertical day made of colored **capsules** (activity blocks) on a spine. Tasks, events, habits, routines, goals, projects, focus and journal all feed the timeline rather than competing with it. See [product overview](docs/product/product-overview.md).
- **What it must feel like:** minimal, warm, readable, precise. Terracotta accent, warm neutrals, hairline borders, almost no shadows. Color belongs to the user's activities, not to chrome.
- **Where the design lives:**
  - Tokens: `src/global.css`.
  - Design-system reference: [docs/design/reference/daycraft-tailwind-v1.1.css](docs/design/reference/daycraft-tailwind-v1.1.css).
  - Interactive prototype: the "Daycraft" design canvas, page **v2 · Current**. Every screen and interaction in the docs was taken from it.
  - **Exported for you:** [docs/design/reference/](docs/design/reference/README.md) has screenshots of every phone screen and sheet (light and dark), plus a runnable offline prototype (`prototype/phone-dark.html`). Look at the screenshot of a screen before building it.
- **What exists in code today:** tokens, fonts, the Uniwind theme and the first UI primitives (`src/components/ui/`). Screens are placeholders (the Expo starter is deleted). The live list is [status-and-decisions](docs/status-and-decisions.md#implementation-status).

## Non-negotiables

1. **Tokens only.** Colors, type, radii, spacing and motion come from `src/global.css` and the docs below. No hex values, no `text-[13px]`-style arbitrary values, no new radii in feature code. If a token is missing, add it to `global.css` and document it. See [design system](docs/design/design-system.md).
2. **Both themes, always.** Use semantic classes (`bg-surface`, `text-ink-muted`, …). Never hardcode light-only colors. White is allowed only for icons and text on activity hues and colored sheet headers. See [theming](docs/design/theming.md).
3. **Reuse before you build.** Check `src/components/ui/` and [components](docs/design/components.md) first. Never fork a primitive to tweak one style; extend its props.
4. **Fonts are families, not weights.** On native use `font-sans`, `font-sans-semibold`, `font-sans-bold`, `font-sans-extrabold`, or the `type-*` presets. Never `font-bold` and never `fontWeight`. See [typography](docs/design/typography.md).
5. **The timeline is precious.** Follow [timeline guide](docs/product/timeline-guide.md) exactly. Label any new timeline behavior as a proposal and get it approved before building it.
6. **Smallest correct change.** No rewrites of working code, no speculative abstractions, no new dependencies without a reason written in the PR or issue.
7. **Never claim a check you did not run.** See [testing](docs/development/testing.md).

## Workflow for every task

1. Understand the request. Read the matching issue in the root `.scratch/<feature-slug>/` if there is one.
2. Read the guide(s) for the area and the related prototype screen.
3. Inspect existing code: routes in `src/app/`, primitives in `src/components/ui/`, tokens in `src/global.css`.
4. Identify reusable components, tokens and helpers. Plan the smallest change that fits the existing architecture.
5. Implement. Keep business logic out of screen components (see [architecture](docs/development/architecture.md)).
6. Verify:
   - Light and dark themes.
   - iPhone 390×844 and 375×812 (plus iPad if the screen supports it).
   - Accessibility labels and roles.
7. Run `bun run check-types` and `bun run lint` (in `apps/mobile`), or `bunx turbo run check-types lint` from the root, plus tests once they exist. Report the real results.
8. If you changed an established pattern or a token, update the relevant doc in the same change.

## Guides

| Area | Read |
|---|---|
| Product, modules, vocabulary | [product-overview](docs/product/product-overview.md) · [navigation-and-modules](docs/product/navigation-and-modules.md) |
| Today timeline (most important) | [timeline-guide](docs/product/timeline-guide.md) |
| Sheets, toasts, editing, completion, focus | [interaction-patterns](docs/product/interaction-patterns.md) |
| Tokens: color, radius, shadow, motion, focus | [design-system](docs/design/design-system.md) |
| Type scale and fonts | [typography](docs/design/typography.md) |
| Spacing, sizes, layout | [spacing-and-layout](docs/design/spacing-and-layout.md) |
| Primitives and component specs | [components](docs/design/components.md) |
| Light/dark implementation | [theming](docs/design/theming.md) |
| Screen sizes, tablet, web | [responsive-design](docs/design/responsive-design.md) |
| Accessibility | [accessibility](docs/design/accessibility.md) |
| Stack, state, data, dates | [architecture](docs/development/architecture.md) |
| Folders and naming | [project-structure](docs/development/project-structure.md) |
| Code style | [coding-conventions](docs/development/coding-conventions.md) |
| Checks and tests | [testing](docs/development/testing.md) |
| Known gaps, discrepancies, open decisions | [status-and-decisions](docs/status-and-decisions.md) |

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json` (currently **58**).
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

The same applies to **Uniwind** (`uniwind` 1.13) — check https://docs.uniwind.dev before using an API you have not seen in this repo.

## Commands

This app is the `@daycraft/mobile` workspace in the Daycraft Turborepo (`apps/mobile`). The monorepo uses **bun** (one `bun.lock` at the root). `npx` refuses to run here because the root `package.json` declares bun in `devEngines`, so use `bunx`. Run these inside `apps/mobile`:

```bash
bunx expo install <package>  # ALWAYS use instead of bun/npm add — resolves SDK-compatible versions
bunx expo start              # start the dev server (or `bun run dev`)
bun run lint                 # expo lint
bun run check-types          # tsc --noEmit
bunx expo-doctor             # diagnose dependency and config issues
bunx expo install --fix      # fix incompatible package versions
```

From the repo root, `bunx turbo run check-types lint` checks every workspace with caching.

Run lint and typecheck before declaring any task done. Restart Metro after changing `metro.config.js` or adding theme variants in `global.css`.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`. Typed routes are on (`experiments.typedRoutes`).
- Docs: https://docs.expo.dev/router/introduction.md
- Planned Daycraft routes: [navigation-and-modules](docs/product/navigation-and-modules.md).

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli@latest <command>`; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `bunx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
- `src/uniwind-types.d.ts` is generated by Uniwind — do not edit it.
- The React Compiler is enabled (`experiments.reactCompiler`). Do not add `useMemo`/`useCallback`/`memo` by reflex; add them only for a measured problem or a referential-identity requirement.

## Agent skills and shared docs

Configured once at the monorepo root; see the root [`AGENTS.md`](../../AGENTS.md#agent-skills). Issues live in the root `.scratch/`, the vocabulary is the root [`GLOSSARY.md`](../../GLOSSARY.md) (use those exact terms), and ADRs go in the root `docs/adr/`. The cross-app architecture plan is [docs/architecture-plan.md](../../docs/architecture-plan.md).

## Keeping these docs true

- New reusable UI patterns must follow the design system. Add them to [components](docs/design/components.md).
- Token names and values are shared with the web app (`apps/web/src/app/globals.css`); change both together. Product docs in `docs/product/` have a web counterpart in `apps/web/docs/product/` with platform-specific differences; update both when the product changes.
- Any token change in `src/global.css` must update [design-system](docs/design/design-system.md) / [typography](docs/design/typography.md) and, if it diverges from the reference CSS, [status-and-decisions](docs/status-and-decisions.md).
- New architectural conventions go in [architecture](docs/development/architecture.md) (and an ADR in the root `docs/adr/` when it is a real decision).
- Never silently introduce a convention that conflicts with these docs. Raise it, then update the doc.
- Preserve existing working behavior unless the task explicitly asks to change it.
