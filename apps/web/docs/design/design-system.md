# Design system on the web

The tokens, their names and the rules for using them are in the root [design system](../../../../docs/design/design-system.md); values live in `@daycraft/design-tokens`. This file covers how the web app (Tailwind CSS v4) implements them. Every token renders on `/design-system`.

## Where tokens come from

- `src/app/globals.css` imports `@daycraft/design-tokens/tailwind.css`, which the token package generates: semantic colors as CSS variables on `:root` (light) and `.dark`, exposed as utilities by `@theme inline` (`bg-canvas`, `text-ink-muted`; opacity modifiers work, `bg-ink/50`), hues, the type scale (`--text-*` with line height, tracking and weight), radii, shadows, the snap easing and the `animate-*` utilities. The `type-*` presets are `@utility` classes, so they work with `@apply` and variants (`md:type-display`). Never edit the generated file; change the package and run its `build`.
- `globals.css` adds the base layer (font, canvas, ink, focus outline) and the reusable component classes (`.chip`, `.btn-primary`, `.segmented`, …) specified in the root [components](../../../../docs/design/components.md).
- Onest loads through `next/font/google` as `--font-onest`; `--font-sans` points at it. Use weight utilities up to `font-semibold` on the web.

## Colors and hues

- Semantic classes only. Dark mode is the `.dark` class on `<html>`, set before first paint by the theme script (see [theming](theming.md)).
- Hue classes come from literal maps (complete strings). When a hue is data-driven inside a computed style, use its CSS variable (`style={{ "--capsule-hue": hueColors.sky }}`) or `color-mix(in srgb, var(--color-clay) 42%, var(--color-surface))` for tints.

## Motion

`animate-sheet-up`, `animate-fade-in`, `animate-pop`, `ease-snap` come from the tokens, plus `--ease-spring-snap` and `--spring-snap-duration`: the native `springs.snap` sampled into a CSS `linear()` curve, so web and mobile springs match (`.segmented-indicator` is the model). Press feedback: `active:scale-96` (primary button `active:scale-98`, check ring `active:scale-90`). Wrap movement in `motion-safe:` or disable it under `prefers-reduced-motion` (see [accessibility](accessibility.md)).

## Focus

`:focus-visible` gives a 2px `accent` outline with a 2px offset (base layer). Never remove outlines without an equal replacement.

## Icons

`Icon` from `@daycraft/icons/web`: decorative (`aria-hidden`), colored by `currentColor`, so set the color with a `text-*` class on it or its parent.
