# Daycraft monorepo

Daycraft is a calm personal planner built around the **Today timeline**. This is a Turborepo with bun workspaces:

| Workspace | What | Entry point |
|---|---|---|
| `apps/mobile` | Expo SDK 58 app, iPhone first | [apps/mobile/AGENTS.md](apps/mobile/AGENTS.md) |
| `apps/web` | Next.js 16 app, desktop and tablet | [apps/web/AGENTS.md](apps/web/AGENTS.md) |
| `packages/domain` | Pure TypeScript domain vocabulary and rules (`ActivityHue`, `IconName`, `ThemePreference`); no dependencies, consumed as TypeScript source | — |
| `packages/design-tokens` | Every design token value; generates both apps' theme CSS, checks contrast, configures `cn` (ADR-0001) | [docs/design/design-system.md](docs/design/design-system.md) |
| `packages/icons` | `Icon` for native and web: Lucide plus custom SVG, keyed by `IconName` (ADR-0002) | — |
| `packages/typescript-config` | Shared tsconfig presets | — |

Before changing files in an app, read that app's `AGENTS.md`; its rules apply inside it.

## Tooling

- bun is the package manager: `bun install`, `bun run <script>`, `bunx <bin>`. The root `package.json` declares bun in `devEngines`, so npm and npx refuse to run.
- Mobile dependencies go in with `bunx expo install <pkg>` inside `apps/mobile`, so Expo picks SDK-compatible versions.
- Verify with `bunx turbo run build check-types lint test` from the root and report the real output. Packages are tested with Vitest; test files (`*.test.ts(x)`) are gitignored, so they run locally and are never committed.
- Keep the root `node_modules` on Babel 7 and one React version. Metro's worklets plugin fails on Babel 8 (a create-turbo ESLint package once pulled it in), and Expo rejects duplicate React or React Native copies. Check `node -p "require('@babel/core/package.json').version"` after adding a package that brings its own Babel.

## Code rules (every workspace)

- A function, method or constructor takes at most two positional parameters. With three or more, it takes one object parameter typed by a named `interface`/`type` declared at the top of the file, never an inline object type. Framework dependency-injection constructors are the exception.
- Enum-likes are a const object plus a same-named union type (the `ActivityHue` pattern in `packages/domain`), never a TypeScript `enum`.
- Conditional class names go through the app's configured `cn()` in object notation (`cn('base', { 'opacity-50': isDisabled })`), never ternaries or string concatenation. Before writing or changing a className, read [docs/agents/rules/cn-object-notation.md](docs/agents/rules/cn-object-notation.md).
- Import a symbol from where it lives. Never create a file that only re-exports another module, and never leave one behind when moving code: update every caller in the same change. Curated barrel `index.ts` files are the exception. See [docs/agents/rules/no-pass-through-re-exports.md](docs/agents/rules/no-pass-through-re-exports.md).

## Commits

A commit title is one line that completes "If merged, this commit will …": imperative, first letter capitalized, no `fix:`-style prefix, no attribution trailer. Multi-line only when the user asks. Before every commit, read [docs/agents/rules/commit-conventions.md](docs/agents/rules/commit-conventions.md).

## Shared docs (one copy, root)

- [`GLOSSARY.md`](GLOSSARY.md): the vocabulary for every app. Use its exact terms in code, UI copy, issues and tests.
- [`docs/design/`](docs/design/design-system.md): the design system for every app (token names and rules, the component spec, and the design reference exports). Token values live in `packages/design-tokens`; both apps render everything at `/design-system`.
- [`docs/architecture-plan.md`](docs/architecture-plan.md): the cross-app architecture plan (mobile, API, web). Proposed, not yet accepted.
- `docs/adr/`: architecture decisions for the whole monorepo, created lazily.
- `docs/agents/`: how the engineering skills use this repo (below).

App-specific docs (design system, product screens, architecture, testing, status) stay in `apps/<app>/docs/`.

## Agent skills

### Issue tracker

Issues live as local markdown files under the root `.scratch/<feature-slug>/`, for every app. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles map 1:1 to labels of the same name (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and one `docs/adr/` at the monorepo root; `docs/adr/` is created lazily. See `docs/agents/domain.md`.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": true` in the root `turbo.json` or `turbo.jsonc` to opt in; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
