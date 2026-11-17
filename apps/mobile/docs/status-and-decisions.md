# Status, discrepancies and open decisions

This is the one place that records where the code, the tokens and the design disagree, and what is decided versus still open. Other docs link here instead of repeating it. Update it whenever you close or discover a gap.

Last reviewed 2026-11-17, after the move into the monorepo: `bun run check-types` and `bun run lint` pass, and `bunx expo export --platform ios` bundles.

## Sources of truth (in priority order)

1. **Design canvas, page "v2 · Current"**: decides what screens, behavior and token values *should* be. Exported as screenshots and a runnable prototype in [design/reference/](design/reference/README.md).
2. **`@daycraft/design-tokens`** (planned, [ADR-0001](../../../docs/adr/0001-design-tokens-generated-from-typescript.md)): decides what the app renders, and changes only to match the canvas. Until it lands, `src/global.css` is what renders; the gaps against v1.1 are listed below.
3. **[design/reference/daycraft-tailwind-v1.1.css](design/reference/daycraft-tailwind-v1.1.css)**: a frozen export of design system v1.1, kept for reference only.
4. These docs explain 1–3. If a doc contradicts 1–3 and is not listed below, the doc is wrong. Fix it.

The canvas pages "v2 · Refined" and "v1 · Original" are **superseded**. Do not copy values from them.

## Implementation status

| Area | State |
|---|---|
| Monorepo: this app is `apps/mobile` (`@daycraft/mobile`) in the Daycraft Turborepo, with bun workspaces and one root `bun.lock`. Scaffolded with `create-turbo`; history imported with `git subtree`. New root dev dependencies: `turbo` (task runner and cache), `prettier` (from the scaffold). | Done 2026-11-17. `turbo run build check-types lint` passes and the iOS export matches the pre-move bundle. |
| Uniwind + Tailwind v4 pipeline (`metro.config.js`, `src/global.css`) | Done |
| Semantic light/dark tokens, activity hues, radii, type sizes | Done (v1.0 values, see gaps) |
| Plus Jakarta Sans (Regular, SemiBold, Bold, ExtraBold) via `expo-font` plugin | Done |
| Theme at root (`bg-canvas`, `Uniwind.updateInsets`, React Navigation `ThemeProvider`) | Done |
| UI primitives in `src/components/ui/`: `Button`, `Capsule`, `CheckRing`, `Chip`, `Tag`, `Segmented`/`SegmentedButton`, `Sheet`, `SectionLabel`, `ActivityHue` | Done (first pass) |
| Screens (`src/app/index.tsx`, `explore.tsx`), `app-tabs`, `ThemedText`, `ThemedView`, `HintRow`, `Collapsible`, `animated-icon`, `web-badge`, `external-link` | **Expo starter template.** Replace, do not extend. |
| Domain model, data layer, persistence | Not started |
| Today timeline, all modules | Not started (prototype only) |
| Tests | Not set up |
| Brand assets (icon, splash, app name) | Not applied: still Expo defaults, `name: daycraft_app`, splash `#208AEF` |

## Token gaps: `global.css` (v1.0) vs design system v1.1

| Token / component | `global.css` now | v1.1 target | Notes |
|---|---|---|---|
| Dark `--color-elevated` | `#2c2a27` | `#312e2b` | v1.1 raised it so selected segments and the tab bar separate from `sunken` |
| Type: `title` | missing | 24px / 800 / −0.02em | secondary page titles (project detail) |
| Type: `body-sm` | missing | 14px / 1.45 | subtitles, descriptions, notes |
| Type: `control` | missing | 13px / 600 | chips, segmented. Primitives currently use `text-[13px]`. Replace with the preset when added. |
| Type: `micro` | missing | 11px / 600 | timeline gutter, tab labels |
| Type: `clock` | missing | 56px / 800 / −0.03em | focus timer only |
| Radius `check` / `tile` / `panel` | missing | 6 / 12 / 24px | checkbox squares; icon tiles; desktop panels |
| `--radius-chip` | 18px, used by `.chip` | pills use `rounded-full` | v1.1 dropped hand-computed half radii |
| `.chip` padding | 14px | 16px; plus `chip-sm`: h 32, px 12, gap 4 | |
| `.tag` padding | 10px | 8px | |
| `.segmented` radius / button radius | 13 / 10px | 12 / 9px | |
| `CheckRing` size | 26px, `hitSlop` 9 | 24px, `hitSlop` 10 (44px target) | |
| `CheckRing` colors | `border-ink-subtle`, checked → `border-success` | ring border = the activity's hue; checked → filled with the hue, white check | prototype behavior; needs a `hue` prop |
| `Button` text | `text-base` (16px) | 15px bold (`type-body` size with bold family) | v1.1 also adds `md` size (h 44) |
| Medium weight (500) | not embedded | prototype uses 500 for body/meta | **Decided (2026-11-17):** embed Medium from `@expo-google-fonts/plus-jakarta-sans` and add `font-sans-medium`. Replaces the earlier "map 500 to Regular". |

When you implement a v1.1 token, also replace the arbitrary values it replaces (for example `text-[13px]`, `rounded-[10px]`) in the primitives.

## Template leftovers that conflict with the design system

- `src/constants/theme.ts`:
  - `Colors` mirrors some tokens for imperative APIs. Keep it only for APIs that cannot take a class or `useCSSVariable`, and keep the values identical to `global.css`.
  - Its `Spacing` names (`one`=4 … `three`=16, `six`=64) do **not** match the 4px Tailwind scale. Do not use `Spacing` in new code; use Tailwind spacing classes.
  - `Fonts` and `MaxContentWidth` are template values.
- `ThemedText` / `ThemedView` use `StyleSheet`, template sizes (48px titles) and `fontWeight`. Do not use them in Daycraft screens. Use `Text` with `type-*` classes and `View` with semantic classes.
- `app-tabs.tsx` / `app-tabs.web.tsx` render the template's Home/Explore tabs. They will be replaced by Daycraft navigation (see open decision D1).

## Design system decisions (2026-11-17)

Settled in a design-system review; the spec and tickets live in the root `.scratch/design-system/`.

- **Baseline:** design canvas page "v2 · Current" (Plan · Habits · + · Goals · More). "v2 · Refined" and "v1 · Original" are superseded.
- **Tokens:** `@daycraft/design-tokens` holds every value in TypeScript and generates each app's `theme.generated.css`; contrast pairs are checked in `build` ([ADR-0001](../../../docs/adr/0001-design-tokens-generated-from-typescript.md)).
- **Version:** both apps move to design system v1.1 before any screen is built.
- **Icons:** `@daycraft/icons`, Lucide at stroke 1.9 with the prototype's SVG for `m1`–`m5`, `run` and `timeline`; data stores Daycraft icon names ([ADR-0002](../../../docs/adr/0002-lucide-icons-with-custom-fallback.md)).
- **Names owned by the domain:** `ActivityHue` and `IconName` move to `packages/domain`; the visual packages map them.
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
