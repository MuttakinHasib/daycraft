# Status, discrepancies and open decisions

This is the one place that records where the code, the tokens and the design disagree, and what is decided versus still open. Other docs link here instead of repeating it. Update it whenever you close or discover a gap.

Last reviewed against commit `43ba9e8` (“Add the ESLint config and fix template lint and type errors”). At that commit:

- `npx tsc --noEmit` passed.
- `eslint .` passed (the same config `npx expo lint` uses).

## Sources of truth (in priority order)

1. **`src/global.css`**: the token values the app actually renders.
2. **Design system v1.1**:
   - The canvas page "v2 · Refined" → board "Design system v1.1 + refinement log".
   - Mirrored as CSS in [design/reference/daycraft-tailwind-v1.1.css](design/reference/daycraft-tailwind-v1.1.css).
   - It is the **target**: where it differs from `global.css` (table below), bring `global.css` up to v1.1 in a dedicated change and update this file.
3. **Interactive prototype**:
   - The canvas boards "v2 · iPhone 390", "v2 · iPhone 375" and "v2 · Desktop".
   - They are the reference for screens, layout and behavior. They are exported as screenshots and a runnable prototype in [design/reference/](design/reference/README.md).
4. These docs explain 1–3. If a doc contradicts 1–3 and is not listed below, the doc is wrong. Fix it.

The canvas page "v1 · Original" is **superseded**. Do not copy values from it.

## Implementation status

| Area | State |
|---|---|
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
| Medium weight (500) | not embedded | prototype uses 500 for body/meta | **Decision:** on native, 500 maps to `PlusJakartaSans-Regular`. Add `PlusJakartaSans-Medium` only if design review asks for it. |

When you implement a v1.1 token, also replace the arbitrary values it replaces (for example `text-[13px]`, `rounded-[10px]`) in the primitives.

## Template leftovers that conflict with the design system

- `src/constants/theme.ts`:
  - `Colors` mirrors some tokens for imperative APIs. Keep it only for APIs that cannot take a class or `useCSSVariable`, and keep the values identical to `global.css`.
  - Its `Spacing` names (`one`=4 … `three`=16, `six`=64) do **not** match the 4px Tailwind scale. Do not use `Spacing` in new code; use Tailwind spacing classes.
  - `Fonts` and `MaxContentWidth` are template values.
- `ThemedText` / `ThemedView` use `StyleSheet`, template sizes (48px titles) and `fontWeight`. Do not use them in Daycraft screens. Use `Text` with `type-*` classes and `View` with semantic classes.
- `app-tabs.tsx` / `app-tabs.web.tsx` render the template's Home/Explore tabs. They will be replaced by Daycraft navigation (see open decision D1).

## Open decisions

| ID | Question | Options | Current lean |
|---|---|---|---|
| D1 | Tab bar | (a) `expo-router/native-tabs` (native iOS tab bar, Liquid Glass) for Inbox · Today · Calendar · Browse, plus a separate floating **+** button. (b) Custom floating pill tab bar exactly like the prototype. | Undecided. The prototype's pill bar plus the round + button is the design reference. Native tabs match platform conventions. Decide before building navigation. |
| D2 | Persistence / backend | Local-first store (e.g. SQLite via `expo-sqlite`) vs remote API + cache | Undecided. Keep domain logic pure so either works. |
| D3 | Web / desktop | This repo is the **mobile** app (`mobile.daycraft.com`). The desktop design (prototype "Desktop 1440/768/1920") is planned as a separate Next.js app sharing the same tokens. `app.json` still has an Expo web target from the template. | Treat Expo web as a dev convenience, not a product surface, until decided. |
| D4 | Icon set | Prototype icons are 24px, 1.9px stroke, round caps and joins. The template uses `expo-symbols` (SF Symbols). | Undecided. Whatever is chosen must match stroke weight and optical size across the app. |
| D5 | Delete confirmation | Prototype deletes immediately with a toast | Proposed: toast with **Undo** (5s) instead of a confirm dialog |

Record each resolved decision as an ADR in `docs/adr/` (see `docs/agents/domain.md`) and update this table.
