# Theming (light and dark)

## How it works in this repo

- `src/global.css` defines every semantic color **twice**, under `@layer theme { :root { @variant light { … } @variant dark { … } } }`. Uniwind compiles both. Both variants must define **the same set of variables**. Adding one to only one variant is a bug.
- The active theme follows the OS (`app.json → userInterfaceStyle: "automatic"`). There is no `.dark` class on native. The app can override at runtime with `Uniwind.setTheme(...)`; check the Uniwind docs for the accepted values, including returning to system.
- Activity hues, fonts, type sizes and radii live in `@theme` and do not change per theme.
- Shadows that change per theme use `light-dark()` inside `@utility` (`shadow-float`).
- React Navigation chrome gets `DarkTheme`/`DefaultTheme` in `src/app/_layout.tsx`. `src/constants/theme.ts → Colors` mirrors a few tokens for APIs that need raw values (native tab bar colors). Keep those values identical to `global.css`. Prefer `useCSSVariable('--color-…')` when you need a token value in JS: it is reactive to theme changes (see `capsule.tsx`).

## Rules

1. Every component and screen must look correct in **both** themes before it is done. Check both on device or simulator.
2. Use semantic classes: `bg-canvas/surface/sunken/elevated`, `text-ink/ink-muted/ink-subtle/accent-text/on-accent`, `border-line/line-strong`. Never use `bg-white`, `text-black`, `bg-gray-*`, hex values, or the `dark:` variant to patch a light-only color.
3. The `dark:` variant is allowed only for a genuinely theme-specific design difference that has no semantic token. If you need one twice, add a token instead.
4. Text on `accent` uses `text-on-accent`. In dark mode the accent is light (`#E4815D`), so on-accent is dark (`#241109`). Never hardcode white text on accent.
5. Activity hues are the same in both themes and always carry white icons and text.
6. Hairlines (`line`) separate surfaces; do not add shadows to separate things in dark mode.
7. Images and illustrations must use token colors (or come in light and dark versions).
8. The status bar follows the theme (`expo-status-bar` `style="auto"`).

## Adding or changing a token

1. Add or change it in **both** `@variant light` and `@variant dark` (or in `@theme` if it is theme-independent).
2. Restart Metro (Uniwind regenerates `src/uniwind-types.d.ts`).
3. If `Colors` in `constants/theme.ts` mirrors it, update that too.
4. Update [design-system](design-system.md). If it diverges from the v1.1 reference, record it in [status-and-decisions](../status-and-decisions.md).

## Theme preference (planned)

- Appearance options: **System**, **Light**, **Dark**. The prototype only has Light/Dark.
- Persist the choice. Apply it with `Uniwind.setTheme` before the first frame if possible, to avoid a flash.
- Switching must not reset navigation or scroll position.

## Web / desktop (separate Next.js app)

The desktop design uses the same token names through Tailwind v4 on the web:

- `:root` / `.dark` CSS variables mapped with `@theme inline`;
- a `dark` class on `<html>`;
- the `@custom-variant dark`.

[design/reference/daycraft-tailwind-v1.1.css](reference/daycraft-tailwind-v1.1.css) is that file. Keep token **names and values identical** across both apps. Change both in the same pass.
