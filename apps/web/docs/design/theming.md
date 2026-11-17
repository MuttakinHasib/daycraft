# Theming (light and dark)

## Mechanism (from the reference CSS)

- Light values on `:root`, dark values on `.dark`. Both define the same set of variables.
- `@custom-variant dark (&:where(.dark, .dark *));` makes `dark:` respond to the **class**, not the media query.
- `@theme inline { --color-canvas: var(--canvas); … }` exposes the variables as utilities (`bg-canvas`). Because it is `inline`, utilities follow the class at runtime.
- `color-scheme: light` / `dark` is set per theme so native controls and scrollbars match.
- The template's `@media (prefers-color-scheme: dark)` block goes away when the tokens are wired in.

## Applying the theme without a flash

Decision W2 ([status](../status-and-decisions.md#open-decisions)). Whichever option is chosen:

- The `dark` class must be on `<html>` **before first paint**. Either the server renders it from a cookie, or a tiny inline script in `<head>` reads the stored preference or `matchMedia('(prefers-color-scheme: dark)')`.
- Preference values: `system` (default), `light`, `dark`. `system` follows `prefers-color-scheme` and updates live.
- Switching must not reload the page or lose scroll and selection.
- The sidebar's Light/Dark control is a segmented control; add **System** when persistence lands.
- Expect `<html>` to need `suppressHydrationWarning` when a script changes its class before hydration. Check the current Next.js docs.

## Rules

1. Every component must be checked in **both** themes before it is done.
2. Use semantic utilities only:
   - backgrounds: `bg-canvas`, `bg-surface`, `bg-sunken`, `bg-elevated`;
   - text: `text-ink`, `text-ink-muted`, `text-ink-subtle`, `text-accent-text`, `text-on-accent`;
   - borders: `border-line`, `border-line-strong`.
   Never use `bg-white`, `text-black`, `zinc-*`/`gray-*`, hex values, or `dark:` to patch a light-only color.
3. Use `dark:` only for a genuine design difference with no token. If it repeats, add a token.
4. Text on `accent` is `text-on-accent`: it is dark in dark mode.
5. Activity hues are identical in both themes and carry white icons and text.
6. Separate surfaces with hairlines, not shadows, in both themes.
7. Images and illustrations use token colors or ship in light and dark versions (`dark:hidden` / `hidden dark:block`).

## Changing a token

1. Change it in both `:root` and `.dark` (or in `@theme` if it is theme-independent).
2. Make the **same change in `apps/mobile/src/global.css`**, where the names are prefixed `--color-*` inside Uniwind `@variant light/dark`.
3. Update [design-system](design-system.md). Record any temporary divergence in [status-and-decisions](../status-and-decisions.md).
