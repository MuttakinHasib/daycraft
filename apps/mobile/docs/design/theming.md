# Theming (light and dark)

## How it works in this repo

- Every semantic color is defined twice, under `@layer theme { :root { @variant light { … } @variant dark { … } } }`, in the CSS that `@daycraft/design-tokens` generates (imported by `src/global.css`). The token build guarantees both variants define the same set.
- The active theme follows the saved preference: System follows the OS (`app.json → userInterfaceStyle: "automatic"`), Light and Dark override it through `Uniwind.setTheme` (which also sets React Native's `Appearance`, so native alerts match). There is no `.dark` class on native.
- Activity hues, fonts, type sizes and radii live in `@theme` and do not change per theme.
- Shadows that change per theme use `light-dark()` inside `@utility` (`shadow-float`).
- **One theme module** (`src/theme/app-theme.tsx`) owns everything that cannot take a className. Uniwind decides light or dark; the module reads it with `useUniwind()` and exposes `useColorScheme()` and `useThemeColors()` (token values, reactive to theme changes), and `AppTheme` gives React Navigation the Daycraft colors, and themes the status bar. Builds keep the SDK template's `UIViewControllerBasedStatusBarAppearance = YES`, so each screen owns its status bar: the Stack gets `statusBarStyle` from `useScreenStatusBarStyle()`, and a screen that needs a different style sets that option itself. Expo Go hard-codes the key to NO and rejects per-screen styles, so there `AppTheme` renders one app-wide `expo-status-bar` instead. Never call React Native's `useColorScheme` or copy hex values into code.

## Rules

1. Every component and screen must look correct in **both** themes before it is done. Check both on device or simulator.
2. Use semantic classes: `bg-canvas/surface/card/sunken/elevated/raised`, `text-ink/ink-muted/ink-subtle/accent-text/on-accent/on-hue`, `border-line/line-strong`. Never use `bg-white`, `text-black`, `bg-gray-*`, hex values, or the `dark:` variant to patch a light-only color.
3. The `dark:` variant is allowed only for a genuinely theme-specific design difference that has no semantic token. If you need one twice, add a token instead.
4. Text on `accent` uses `text-on-accent`. In dark mode the accent is a light blue, so on-accent is dark. Never hardcode white text on accent.
5. Activity hues are the same in both themes and carry `text-on-hue` (white) icons and text. Hues are never used as a text color.
6. Fills separate surfaces (`surface` sheets, gray `card` blocks); cards have no border. Hairlines (`line`) only separate rows. Do not add shadows to separate things.
7. Images and illustrations must use token colors (or come in light and dark versions).
8. The status bar follows the theme: the Stack's `statusBarStyle` in builds, an app-wide `<StatusBar>` in Expo Go.

## Adding or changing a token

1. Change it in `@daycraft/design-tokens` (both themes, or the theme-independent tables) and run `bun run build` there; the contrast check must pass.
2. Restart Metro (Uniwind regenerates `src/uniwind-types.d.ts`).
3. If native code needs it as a value, read it through `useThemeColors()`.
4. Update the root [design system](../../../../docs/design/design-system.md) if the name or rule is new.

## Theme preference

- Options: **System** (default), **Light**, **Dark** (`ThemePreference` and `resolveColorScheme` in `@daycraft/domain`).
- `useThemePreference()` from the theme module returns the preference and a setter. The setter saves it in `expo-sqlite/kv-store` (per device, never synced) and applies it with `Uniwind.setTheme`; the saved value is read synchronously and applied in a layout effect, so a saved Light or Dark never flashes the OS scheme first.
- Switching does not reset navigation or scroll position. The design-system screen has the control until the Appearance screen exists.
- Every `@expo/ui` `Host` takes `colorScheme={useColorScheme()}` from the theme module. Without it the SwiftUI or Compose content follows the phone's own scheme, so with Light chosen on a phone in dark mode the glass buttons draw dark on a light sheet.

## Web

The web app uses the same token names, generated from the same package as `:root` / `.dark` CSS variables. Changing a value in `@daycraft/design-tokens` changes both apps; never edit either app's theme CSS by hand.
