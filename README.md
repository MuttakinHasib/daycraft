# Daycraft

Daycraft is a calm personal planner built around a vertical Today timeline. This repository is a Turborepo monorepo with bun workspaces.

## Layout

| Path | Package | What it is |
|---|---|---|
| `apps/mobile` | `@daycraft/mobile` | Expo SDK 58 app (iPhone first, Android second) |
| `apps/web` | `@daycraft/web` | Next.js 16 app for desktop and tablet |
| `packages/typescript-config` | `@repo/typescript-config` | Shared tsconfig presets (from the create-turbo scaffold) |

Each app keeps its own `AGENTS.md` and `docs/`. Read those before changing an app.

## Commands

Use bun. The root `package.json` declares bun in `devEngines`, so `npm` and `npx` refuse to run here.

```bash
bun install                                  # install every workspace (one bun.lock at the root)
bunx turbo run build check-types lint        # check everything, cached
bunx turbo run dev --filter=@daycraft/web    # run one app
```

Add mobile dependencies with `bunx expo install <pkg>` inside `apps/mobile`, so Expo picks SDK-compatible versions.

## Tasks

`turbo.json` defines `build`, `check-types`, `lint` and `dev`. `dev` is persistent and never cached. Store builds run on EAS, outside Turborepo.
