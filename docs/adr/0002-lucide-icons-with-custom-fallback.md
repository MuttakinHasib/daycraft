# Icons are Lucide with a custom-SVG fallback, keyed by Daycraft icon names

`@daycraft/icons` renders each icon from Lucide (`lucide-react-native` on mobile, `lucide-react` on web) at the design's 1.9 stroke when Lucide has an icon with the same meaning, and from the prototype's own SVG otherwise: the five mood faces `m1`–`m5`, `run` and `timeline`. Stored data (activities, habits, routines, moods) keeps Daycraft icon names such as `run` or `cap`, never library names, so swapping a glyph or the library never touches synced data.

## Considered options

- **All custom SVG from the prototype:** an exact match, but every new icon would have to be drawn by hand.
- **Lucide only:** no runner, no product-specific timeline glyph, and no consistent five-step mood scale.
- **SF Symbols on iOS:** a different look on Android and web.

## Consequences

- `IconName` is a const object plus union type owned by `packages/domain`; `@daycraft/icons` maps every name and a type check fails if one is missing.
- Mobile depends on `react-native-svg` (SDK 58 bundles 15.16.0, which `lucide-react-native` supports).
