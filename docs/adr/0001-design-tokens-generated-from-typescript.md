# Design tokens live in TypeScript and the CSS is generated per platform

Token values (semantic colors per theme, activity hues, radii, type scale, font families, shadows, motion) live once in `@daycraft/design-tokens` as TypeScript const objects. A generator writes a committed `theme.generated.css` for each app, because mobile (Uniwind, `@variant light/dark`) and web (Tailwind v4, `.dark` class) declare dark mode differently, and native code also needs raw values for APIs that cannot take a class (Reanimated, navigation theme, status bar). The generator also checks the contrast pairs the design system promises and fails the build when one drops below target.

## Considered Options

- **One shared CSS file imported by both apps:** rejected; the dark-mode syntax differs and native would still need the values in JavaScript.
- **Hand-synced CSS per app (the old setup):** rejected; values already drifted (mobile `global.css` is v1.0 while the design is v1.1).

## Consequences

- Never edit `theme.generated.css` by hand. To change a token, edit the package to match the design canvas and regenerate.
- Docs name tokens and their rules; hex values live only in the package.
- The names of activity hues are domain data and belong to `packages/domain`; the token package maps each name to a value.
