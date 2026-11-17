# Visual direction "Clean" replaces the cream and terracotta look

Design system v2 (canvas page "v3 · Clean (new direction)") replaces v1.1. The canvas boards, token package and docs moved together on 2026-11-17.

## Context

v1.1 used a cream canvas, a terracotta brand color, muted earthy activity hues with white icons and Plus Jakarta Sans at 700–800. Side by side with current calendar and wellness apps it read as generic and heavy, and the hues were too dark to feel friendly in a full day of blocks.

## Decision

- Neutrals: white `canvas` and `surface`, a light-gray `card` fill instead of bordered cards, dark `ink`.
- Accent: blue (`#3366F0` light, `#3A6AF2` dark), always with white `on-accent` text; blue text on dark uses the lighter `accent-text`. The center + button is `ink`; the active tab is a solid accent pill.
- Activity hues: saturated and the same in both themes, each deep enough for white icons and text (`on-hue`) at 3:1 or better. Timeline capsules use the solid hue. (Revised 2026-11-18: the first v2 hues were pastel with dark `on-hue` icons and a 62% white tint on capsules; they were deepened so icons on hues could be white.)
- Type: Onest (OFL, Google Fonts) at 400–600; no UI text is bolder than semibold.
- Hues are never text. Headline highlights are a 42% hue marker behind the words.
- Logo: Sunrise Pen in `clay` (sun) and `ink` (pen).

## Considered Options

- **Keep v1.1 and only lighten the type:** rejected; the cream and terracotta palette was the main reason it looked generic.
- **Roobert (the reference typeface):** commercial license; Onest is the free stand-in with a similar feel and can be swapped later in `typography.ts` and the two font loaders.
- **Dark icons on bright, pastel hues:** the first v2 choice; it passed contrast but read as washed out next to the white accent text, so the hues were deepened (amber and sun become burnt orange and mustard) to carry white icons.

## Consequences

- New tokens `card` and `on-hue`; the contrast check now covers `ink-subtle` on `card` and `on-hue` on every hue in both themes.
- Mobile embeds `@expo-google-fonts/onest`; web loads Onest through `next/font/google` as `--font-onest`.
- Existing cards that use `bg-surface` with a `line` border should move to `bg-card` without a border as screens are touched.
- The reference screenshots and prototype in `docs/design/reference/` show v2 (Clean).
