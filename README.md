# Daycraft

Daycraft is a calm personal planner built around a vertical **Today timeline**: your day as colored capsules on a spine. Tasks, events, habits, routines, goals, projects, focus and journal all feed the timeline instead of competing with it.

> Status: early development. Design tokens, fonts and the first UI primitives exist in the mobile app; screens are still starter templates. See each app's `docs/status-and-decisions.md`.

## Apps

| Path | Package | What it is |
|---|---|---|
| [`apps/mobile`](apps/mobile) | `@daycraft/mobile` | Expo SDK 58 app (iPhone first, Android second) |
| [`apps/web`](apps/web) | `@daycraft/web` | Next.js 16 app for desktop and tablet |
| [`packages/domain`](packages/domain) | `@daycraft/domain` | Pure TypeScript domain vocabulary and rules, shared by every app |
| [`packages/typescript-config`](packages/typescript-config) | `@daycraft/typescript-config` | Shared tsconfig presets |

## Getting started

Requires Node 24+ and [bun](https://bun.sh) 1.2+.

```bash
git clone https://github.com/MuttakinHasib/daycraft.git
cd daycraft
bun install
```

| Task | Command |
|---|---|
| Check everything (cached) | `bunx turbo run build check-types lint` |
| Run the web app | `bunx turbo run dev --filter=@daycraft/web` |
| Run the mobile app | `cd apps/mobile && bunx expo start` |
| Add a mobile dependency | `cd apps/mobile && bunx expo install <pkg>` |

Use bun throughout: the root `package.json` declares bun in `devEngines`, so npm and npx refuse to run. Store builds and OTA updates for mobile run on EAS, outside Turborepo.

## Docs

- [GLOSSARY.md](GLOSSARY.md): the shared vocabulary for code, UI copy and issues.
- [docs/architecture-plan.md](docs/architecture-plan.md): proposed architecture for mobile, API and web (not yet accepted).
- `apps/*/docs/`: product, design system and development guides per app.
- [AGENTS.md](AGENTS.md): rules for AI coding agents and contributors; each app has its own.

## Stack

Turborepo on bun workspaces · Expo Router, Uniwind + Tailwind CSS v4, Reanimated · Next.js App Router with Cache Components, Tailwind CSS v4 · TypeScript (strict) · React 19 with the React Compiler.
