# Theming (light and dark)

## How it works in this repo

- Every semantic color is defined twice, under `@layer theme { :root { @variant light { … } @variant dark { … } } }`, in the CSS that `@daycraft/design-tokens` generates (imported by `src/global.css`). The token build guarantees both variants define the same set.
- The active theme follows the saved preference: System follows the OS (`app.json → userInterfaceStyle: "automatic"`), Light and Dark override it through `Uniwind.setTheme` (which also sets React Native's `Appearance`, so native alerts match). There is no `.dark` class on native.
- Activity hues, fonts, type sizes and radii live in `@theme` and do not change per theme.
- Shadows that change per theme use `light-dark()` inside `@utility` (`shadow-float`).
- **One theme module** (`src/theme/app-theme.tsx`) owns everything that cannot take a className. Uniwind decides light or dark; the module reads it with `useUniwind()` and exposes `useColorScheme()` and `useThemeColors()` (token values, reactive to theme changes), and `AppTheme` gives React Navigation the Daycraft colors, and `useStatusBarStyle()` feeds the Stack's `statusBarStyle` screen option (iOS status bars are per screen here, so `expo-status-bar` alone has no effect). Never call React Native's `useColorScheme` or copy hex values into code.

## Rules

1. Every component and screen must look correct in **both** themes before it is done. Check both on device or simulator.
2. Use semantic classes: `bg-canvas/surface/sunken/elevated`, `text-ink/ink-muted/ink-subtle/accent-text/on-accent`, `border-line/line-strong`. Never use `bg-white`, `text-black`, `bg-gray-*`, hex values, or the `dark:` variant to patch a light-only color.
3. The `dark:` variant is allowed only for a genuinely theme-specific design difference that has no semantic token. If you need one twice, add a token instead.
4. Text on `accent` uses `text-on-accent`. In dark mode the accent is light (`#E4815D`), so on-accent is dark (`#241109`). Never hardcode white text on accent.
5. Activity hues are the same in both themes and always carry white icons and text.
6. Hairlines (`line`) separate surfaces; do not add shadows to separate things in dark mode.
7. Images and illustrations must use token colors (or come in light and dark versions).
8. The status bar follows the theme through the Stack's `statusBarStyle` option (`useStatusBarStyle()`).

## Adding or changing a token

1. Change it in `@daycraft/design-tokens` (both themes, or the theme-independent tables) and run `bun run build` there; the contrast check must pass.
2. Restart Metro (Uniwind regenerates `src/uniwind-types.d.ts`).
3. If native code needs it as a value, read it through `useThemeColors()`.
4. Update the root [design system](../../../../docs/design/design-system.md) if the name or rule is new.

## Theme preference

- Options: **System** (default), **Light**, **Dark** (`ThemePreference` and `resolveColorScheme` in `@daycraft/domain`).
- `useThemePreference()` from the theme module returns the preference and a setter. The setter saves it in `expo-sqlite/kv-store` (per device, never synced) and applies it with `Uniwind.setTheme`; the saved value is read synchronously and applied in a layout effect, so a saved Light or Dark never flashes the OS scheme first.
- Switching does not reset navigation or scroll position. The design-system screen has the control until the Appearance screen exists.

## Web

The web app uses the same token names, generated from the same package as `:root` / `.dark` CSS variables. Changing a value in `@daycraft/design-tokens` changes both apps; never edit either app's theme CSS by hand.
