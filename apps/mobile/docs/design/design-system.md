# Design system on mobile

The tokens, their names and the rules for using them are in the root [design system](../../../../docs/design/design-system.md); values live in `@daycraft/design-tokens`. This file covers how the mobile app (Uniwind + Reanimated) implements them. Every token renders on the in-app `/more/design-system` screen (More → Design system).

## Where tokens come from

- `src/global.css` imports `@daycraft/design-tokens/uniwind.css`, which the token package generates: semantic colors as `@variant light` / `@variant dark` inside `@layer theme`, hues, font families, type sizes and radii in `@theme`, `shadow-float` / `shadow-lift` utilities, and the `type-*` presets in the component layer (absolute px, because React Native has no unitless line height). Never edit the generated file; change the package and run its `build`.
- Restart Metro after a token change (Uniwind regenerates `src/uniwind-types.d.ts`).
- Values in TypeScript (for APIs that cannot take a class): `useThemeColors()` from the [theme module](theming.md), `hueColors` and `withOpacity` from `@daycraft/design-tokens`.

## Colors and hues

- Semantic classes only (`bg-surface`, `text-ink-muted`, `border-line`). See [theming](theming.md).
- Hue classes come from the literal maps in `src/components/ui/hues.ts`: `ActivityHueBackground` and `ActivityHueBorder`, keyed by `ActivityHue` from `@daycraft/domain`. Add a map there (complete strings) when a new hue property is needed.
- Hue tints: opacity utilities on the hue (`bg-sky/30`), or `withOpacity(hueColors[hue], 0.28)` when a computed color is unavoidable (the active capsule ring).

## Type

- Use the `type-*` presets. On native each weight is its own embedded family, so weight changes go through families: `font-sans`, `font-sans-medium`, `font-sans-semibold` (`-bold` and `-extrabold` exist but the v2 UI never goes above semibold). Never `font-bold` and never `fontWeight`. A family utility after a preset overrides the preset's family (`type-body font-sans-semibold`). See [typography](typography.md).
- Fonts come from `@expo-google-fonts/onest`, embedded at build time by the `expo-font` config plugin in `app.config.ts` (each weight registered under its PostScript name, which matches the token families). Expo Go cannot show them; use a development build.

## Motion

All motion is Reanimated (CSS animations and transitions are Uniwind Pro features). Take durations and the snap curve from `durations` and `easing` in `@daycraft/design-tokens` (`Easing.bezier(...easing.snap)`); `Sheet` is the model. Springs come from `springs` (`withSpring(target, springs.snap)`); `Segmented` is the model. Write shared values with `.set()` so the React Compiler lint passes. Check `useReducedMotion` and replace movement with instant changes or fades.

## Focus

Rely on the platform focus ring (iPad keyboard, Android); never remove it.

## Icons

`Icon` from `@/components/ui`: the shared `@daycraft/icons` glyphs, colored by a class through `colorClassName` (`<Icon name="run" size={22} colorClassName="text-on-hue" />` on a hue, `text-ink` elsewhere).
