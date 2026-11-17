# Status, discrepancies and open decisions

This is the one place that records where the code, the tokens and the design disagree, and what is decided versus still open. Other docs link here instead of repeating it. Update it whenever you close or discover a gap.

Last reviewed 2026-11-17, after the move into the monorepo: `bun run check-types` and `bun run lint` pass, and `bunx expo export --platform ios` bundles.

## Sources of truth (in priority order)

1. **Design canvas, page "v2 · Current"**: decides what screens, behavior and token values *should* be. Exported as screenshots and a runnable prototype in [design/reference/](../../../docs/design/reference/README.md).
2. **`@daycraft/design-tokens`** (planned, [ADR-0001](../../../docs/adr/0001-design-tokens-generated-from-typescript.md)): decides what the app renders, and changes only to match the canvas. Until it lands, `src/global.css` is what renders; the gaps against v1.1 are listed below.
3. **[design/reference/daycraft-tailwind-v1.1.css](../../../docs/design/reference/daycraft-tailwind-v1.1.css)**: a frozen export of design system v1.1, kept for reference only.
4. These docs explain 1–3. If a doc contradicts 1–3 and is not listed below, the doc is wrong. Fix it.

The canvas pages "v2 · Refined" and "v1 · Original" are **superseded**. Do not copy values from them.

## Implementation status

| Area | State |
|---|---|
| Monorepo: this app is `apps/mobile` (`@daycraft/mobile`) in the Daycraft Turborepo, with bun workspaces and one root `bun.lock`. Scaffolded with `create-turbo`; history imported with `git subtree`. New root dev dependencies: `turbo` (task runner and cache), `prettier` (from the scaffold). | Done 2026-11-17. `turbo run build check-types lint` passes and the iOS export matches the pre-move bundle. |
| Uniwind + Tailwind v4 pipeline (`metro.config.js`, `src/global.css`) | Done |
| Design tokens from `@daycraft/design-tokens` (design system v1.1): generated theme CSS imported by `global.css`, contrast checked in its build | Done 2026-11-17 (ticket 02). New workspace dependency: `@daycraft/design-tokens`. |
| Plus Jakarta Sans 400–800 from `@expo-google-fonts/plus-jakarta-sans` via the `expo-font` plugin in `app.config.ts` | Done 2026-11-17 (ticket 03). The old `app.json` entry used a `"font"` key the plugin ignores, so fonts were never embedded before. New dependencies: `@expo-google-fonts/plus-jakarta-sans`, `@types/node` (dev, for `app.config.ts`). |
| Theme at root (`bg-canvas`, `Uniwind.updateInsets`, React Navigation `ThemeProvider`) | Done |
| UI primitives in `src/components/ui/` on v1.1: `Button` (variant, size, icon), `Chip` (selected, size, icon), `Tag`, `Segmented` (options/value/onChange), `CheckRing` (hue), `Capsule`, `Sheet`, `SectionLabel`, `Icon`, hue class maps | Done 2026-11-17 (ticket 04); no arbitrary values, no CSS component layer |
| Icons: `@daycraft/icons` (Lucide + custom SVG) through `Icon` with `colorClassName` | Done 2026-11-17 (ticket 06). New dependencies: `react-native-svg`, `lucide-react-native`, `@daycraft/icons`. |
| Design-system screen (`/design-system`, linked from Plan) | Done 2026-11-17 |
| Expo starter template (screens, themed components, theme hooks, `constants/theme.ts`, reset script, template images) | **Deleted 2026-11-17.** `src/app` holds a placeholder Stack and a placeholder Plan screen until D1. |
| Theme module (`src/theme/app-theme.tsx`): one source for light/dark, token colors for native APIs, navigation theme and status bar | Done 2026-11-17, with the System / Light / Dark preference saved in `expo-sqlite/kv-store` (ticket 07). New dependency: `expo-sqlite`. |
| `cn()` from the `cn` package, configured with Daycraft token names (`src/lib/cn.ts`) | Done 2026-11-17. New dependency: `cn`. |
| Domain model, data layer, persistence | Not started |
| Today timeline, all modules | Not started (prototype only) |
| Tests | Not set up |
| Brand assets (icon, splash, app name) | Not applied: still Expo defaults, `name: daycraft_app`, splash `#208AEF` |

## Token gaps

None. Every v1.1 token is generated from `@daycraft/design-tokens` (2026-11-17). Where the code and the design canvas disagree from now on, record the difference here and fix it in the token package.

## Design system decisions (2026-11-17)

Settled in a design-system review; the spec and tickets live in the root `.scratch/design-system/`.

- **Baseline:** design canvas page "v2 · Current" (Plan · Habits · + · Goals · More). "v2 · Refined" and "v1 · Original" are superseded.
- **Tokens:** `@daycraft/design-tokens` holds every value in TypeScript and generates each app's `theme.generated.css`; contrast pairs are checked in `build` ([ADR-0001](../../../docs/adr/0001-design-tokens-generated-from-typescript.md)).
- **Version:** both apps move to design system v1.1 before any screen is built.
- **Icons:** `@daycraft/icons`, Lucide at stroke 1.9 with the prototype's SVG for `m1`–`m5`, `run` and `timeline`; data stores Daycraft icon names ([ADR-0002](../../../docs/adr/0002-lucide-icons-with-custom-fallback.md)).
- **Names owned by the domain:** `ActivityHue` and `IconName` live in `@daycraft/domain` (done 2026-11-17); the visual packages map them. New dev dependency: Vitest (package tests).
- **Fonts:** `@expo-google-fonts/plus-jakarta-sans` through the `expo-font` config plugin (mobile) and `next/font/google` (web), weights 400, 500, 600, 700, 800. Medium (500) is now embedded on native as `font-sans-medium`.
- **Theme:** System / Light / Dark, System by default, a per-device preference (mobile: `expo-sqlite/kv-store`; web: a cookie).
- **Components:** one spec in the root `docs/design/`; each platform implements its own primitives.
- **Packages:** every workspace package is named `@daycraft/*`. Brand assets go in `packages/brand` once the logo files are supplied.

## Open decisions

| ID | Question | Options | Current lean |
|---|---|---|---|
| D1 | Tab bar | (a) `expo-router/native-tabs` (native iOS tab bar, Liquid Glass) for Inbox · Today · Calendar · Browse, plus a separate floating **+** button. (b) Custom floating pill tab bar exactly like the prototype. | Undecided. The prototype's pill bar plus the round + button is the design reference. Native tabs match platform conventions. Decide before building navigation. |
| D2 | Persistence / backend | Local-first store (e.g. SQLite via `expo-sqlite`) vs remote API + cache | Proposed, not accepted: offline-first `expo-sqlite` + Drizzle, syncing to a Hono API on Cloudflare (root [architecture-plan](../../../docs/architecture-plan.md)). Keep domain logic pure until it is accepted. |
| D3 | Web / desktop | This app is the **mobile** app (`apps/mobile`). The desktop design (prototype "Desktop 1440/768/1920") is the Next.js app in `apps/web`, sharing the same tokens. `app.json` still has an Expo web target from the template. | Decided: desktop and tablet are `apps/web`. Treat Expo web as a dev convenience, not a product surface. |
| D4 | Icon set | Prototype icons are 24px, 1.9px stroke, round caps and joins. | **Decided:** Lucide with a custom-SVG fallback, keyed by Daycraft icon names ([ADR-0002](../../../docs/adr/0002-lucide-icons-with-custom-fallback.md)). |
| D5 | Delete confirmation | Prototype deletes immediately with a toast | Proposed: toast with **Undo** (5s) instead of a confirm dialog |

Record each resolved decision as an ADR in the monorepo root `docs/adr/` (see the root `docs/agents/domain.md`) and update this table.
