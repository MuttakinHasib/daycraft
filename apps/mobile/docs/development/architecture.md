# Architecture

## Stack (from `package.json` and config, not assumptions)

| Concern | Choice | Notes |
|---|---|---|
| Runtime | **Expo SDK 58**, React Native 0.88, React 19.3 | Continuous Native Generation: no `ios/` or `android/` in git |
| Language | TypeScript ~6.0, `strict: true` | Path aliases `@/*` → `src/*`, `@/assets/*` → `assets/*` |
| Routing | **Expo Router** 58, typed routes on | Routes in `src/app/` |
| Styling | **Uniwind** 1.13 + **Tailwind CSS v4** (`tailwindcss` ^4.3) | `className` on RN components; tokens in `src/global.css`; Metro wrapped with `withUniwindConfig` (must stay outermost) |
| Animation | `react-native-reanimated` 4.7 + `react-native-worklets` | All motion. CSS animations/transitions are Uniwind Pro features and are not used. |
| Gestures | `react-native-gesture-handler` 3.3 | Timeline drag and resize |
| Fonts | `expo-font` config plugin | Onest, one family per weight |
| Images / symbols | `expo-image`, `expo-symbols` | Icon library undecided (D4) |
| Compiler | React Compiler enabled | Do not hand-memoize by default |
| Lint | ESLint 9 flat config + `eslint-config-expo` | `bun run lint` (`expo lint`) |
| Package manager | bun, in the root Turborepo (`apps/mobile` workspace) | `bunx expo install` for every dependency |
| Monorepo | Turborepo 2.x on bun workspaces | Root `turbo.json`: `build`, `check-types`, `lint`, `dev` |
| Tests | Vitest: domain functions, and the activity repository against SQLite in Node (`better-sqlite3`) | see [testing](testing.md) |

Not chosen yet (do not introduce without a decision recorded in [status-and-decisions](../status-and-decisions.md#open-decisions)):

- a state library;
- a persistence layer;
- a backend/API client;
- a form library;
- a date library;
- an icon library.

## Layers

Keep three layers. Do not add more without a real need.

```text
src/app/            Routes: compose features, read params, no business logic
src/features/<x>/   Feature UI + hooks for one module (plan, inbox, habits…)
src/components/ui/  Design-system primitives (no domain knowledge)
src/data/           Persistence and (later) API access behind small repository functions
```

Pure rules (types, calculations, no React) live in `@daycraft/domain` (`packages/domain/src/`), shared with the other app.

- `packages/domain/src/` is where correctness lives, and it is unit-tested:
  - timeline layout (`layoutDay`, `mapTimeToY`, gap detection);
  - next free slot;
  - snapping and clamping;
  - habit streaks and weekly counts;
  - progress calculations;
  - recurrence expansion;
  - formatting of times, durations and relative dates.
- Feature hooks (`useDayActivities(date)`, `useHabits()`) connect domain and data to UI. Screens stay declarative.
- Primitives never import from `features/` or `domain/`. Shared domain vocabulary such as `ActivityHue` comes from the `@daycraft/domain` package, which primitives may import.

## State

- **Local UI state** (sheet open, draft fields, filter chip, expanded card): `useState` in the component that owns it. Do not lift state further up than needed.
- **Route state** (selected activity, project, edit vs new): route params via Expo Router. A sheet's identity belongs in the URL, not in a global store.
- **Selected date** (shared by Today, Calendar and the month picker): the one piece of cross-screen client state. Keep it in a small context or a route param. Do not adopt a state library for it alone.
- **Persistent data** (activities, habits, routines, …): behind `src/data/` repositories, exposed through feature hooks. Until D2 is decided, an in-memory store seeded from fixtures (the prototype's sample day) is acceptable for UI work. Mark it clearly as temporary.
- **Optimistic updates:** completing, moving and resizing must update the UI immediately and roll back with an error toast if persistence fails.

## Dates and time

Activities use **floating local time**:

- `date: 'YYYY-MM-DD'` (the user's calendar date);
- `start: minutes from midnight`.

A 9:30 meeting stays at 9:30 when the user travels. This matches the prototype and keeps the timeline math integer-based.

- **Never** parse `'YYYY-MM-DD'` with `new Date(string)`: it is treated as UTC and can shift a day. Build dates with `new Date(year, monthIndex, day)` or a date library's local parser.
- Keep all date math in `@daycraft/domain`: `calendar.ts` (add, diff in days, week start) and `timeline/format.ts` (relative labels like Today/Tomorrow/"Thu, Nov 19", `9:30–11:30 AM` ranges, `1 hr 30 min` durations).
- **Week starts on Sunday** (prototype week strip and month grid). If this becomes a setting, it must flow through one function.
- The day's timeline range is 05:00–24:00. Activities after midnight are not supported yet (record it if a feature needs them).
- Real timestamps (`createdAt`, focus `endsAt`) are ISO-8601 UTC strings.
- **Now** comes from one source (a `useNow(intervalMs)` hook that ticks on minute boundaries) so tests can inject a fixed clock. The prototype's fixed clock was 10:40 AM on Tue, Nov 17, 2026.

## Forms and validation

- Sheets keep the draft in local state. Their `TextInput`s take a `defaultValue` and report each change instead of being controlled. A controlled input re-renders the whole sheet on every keystroke and drops characters when typing is fast. Saving validates the draft:
  - title required;
  - habit name required;
  - routine name and ≥ 1 step required.
- On failure, show the toast copy from [interaction-patterns](../product/interaction-patterns.md) and keep the sheet open. No form library until a form needs more than this.
- Validation functions live in `packages/domain/src/` and return typed results (`{ ok: true, value } | { ok: false, reason }`) so they are testable without UI.

## Errors

- Domain functions are total where possible: they clamp and normalize rather than throw.
- The data layer throws or returns typed errors. Feature hooks turn them into UI state.
- Screens show inline errors with Retry (see [components](../design/components.md#loading-and-errors-screens)).
- Never swallow errors silently. Never show raw error messages to users.

## Performance

- The timeline renders all of a day's rows absolutely positioned inside one `ScrollView`. A day has tens of rows, not thousands, so do not virtualize it.
- Compute the layout once per (activities, drag preview) change. With the React Compiler this is automatic when the computation is a pure function of props/state.
- Drag and resize run on the UI thread (Reanimated shared values). Do not `setState` on every pointer move on native. Commit on release.
- Long lists (Tasks, Upcoming, journal history) use `FlatList`/`FlashList`-style virtualization once they can exceed about 50 items.
- Images through `expo-image`.

## Platform files

Use `.web.tsx` / `.ios.tsx` platform extensions only when behavior truly differs (the template's `app-tabs.web.tsx` and `use-color-scheme.web.ts` are examples). Prefer the `ios:` / `android:` / `native:` / `web:` Uniwind variants for styling differences.
