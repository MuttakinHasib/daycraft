# Typography

## Typeface

**Onest** only (design system v2, [ADR-0008](../../../../docs/adr/0008-visual-direction-clean.md)), from `@expo-google-fonts/onest`, embedded by the `expo-font` config plugin in `app.config.ts` (no runtime loading; Expo Go cannot show it, use a development build). Family names come from `fontFamilies` in `@daycraft/design-tokens`:

| Family name (native) | Class | Weight |
|---|---|---|
| `Onest-Regular` | `font-sans` | 400 |
| `Onest-Medium` | `font-sans-medium` | 500 |
| `Onest-SemiBold` | `font-sans-semibold` | 600 |
| `Onest-Bold` | `font-sans-bold` | 700 (embedded, not used by presets) |
| `Onest-ExtraBold` | `font-sans-extrabold` | 800 (embedded, not used by presets) |

React Native does not synthesize weights from one family. **Choose weight by family class, never `font-bold` / `fontWeight`.** RN `Text` has no font stack or fallback, so do not add fallbacks.

Use **tabular figures** for times, durations, counts and percentages: `fontVariant: ['tabular-nums']`, or a `tabular-nums` class if Uniwind supports it on your target (check). Timeline labels, toasts with times, rings and the focus clock all need it.

## Scale (design system v2)

Use a **`type-*` preset** wherever one exists. Presets bundle size, line height, letter-spacing and family, with px values so they land on RN `Text` directly. They are generated from `typeScale` in `@daycraft/design-tokens`; the table below explains use, the package holds the numbers.

| Preset | Size / line | Tracking | Family | Use |
|---|---|---|---|---|
| `type-display` | 30 / 33 | −0.9px | semibold | Screen titles: Inbox, Habits, Tasks… |
| `type-date` | 27 / 31 | −0.81px | semibold | Today's date header only |
| `type-title` | 24 / 28 | −0.6px | semibold | Secondary page titles (project detail), focus “Session complete” |
| `type-heading` | 20 / 25 | −0.3px | semibold | Sheet titles, editor/detail title, empty-state titles, Calendar header |
| `type-activity` | 16 / 21.6 | −0.16px | semibold | Activity titles, card titles, list primary text that needs emphasis |
| `type-body` | 15 / 22.5 | 0 | regular | Rows, inputs, buttons (semibold family), body copy |
| `type-body-sm` | 14 / 20 | 0 | regular | Subtitles, descriptions, notes, gap hints |
| `type-control` | 13 / 18 | 0 | medium | Chips, segmented controls |
| `type-meta` | 12.5 / 17 | 0 | regular | Time ranges, counts, secondary lines |
| `type-label` | 12 / 16 (code sets no line height yet) | +0.72px, UPPERCASE | semibold | Section labels (`SectionLabel`) |
| `type-micro` | 11 / 14 | 0 | medium | Timeline gutter, tab labels, habit names, weekday initials |
| `type-clock` | 56 / 60 | −1.7px | medium | Focus timer only |

Twelve sizes, nothing else. Mapping rules for anything not listed:

- 9.5–10.5 → micro;
- 13.5 → body-sm;
- 14.5 → body;
- 17–18 → activity or heading;
- 22–26 → heading or title.

## Weight

- **800 (extrabold):** display, date, title, heading, and numerals inside progress rings.
- **700 (bold):** activity titles, buttons, labels, tag text, badges.
- **600 (semibold):** controls, micro, emphasised meta.
- **400 (regular):** body, body-sm, meta.

Do not bold body text for emphasis; use `ink` versus `ink-muted` contrast instead. Never put two extrabold elements next to each other in a row.

## Color pairing

| Text role | Color |
|---|---|
| Primary | `text-ink` |
| Secondary (meta, subtitles) | `text-ink-muted` |
| Tertiary (hour labels, section labels, placeholders) | `text-ink-subtle` |
| Accent text (back links, year, gap durations, now label) | `text-accent-text` |
| On accent | `text-on-accent` |
| On hue | `text-on-hue` (white in both themes) |
| Sheet header band | Light: `text-ink` on the 40% tint. Dark: `text-on-hue` on the solid hue |
| Done | `text-ink-subtle` + `line-through` |

## Wrapping and truncation

- Activity titles on the timeline: one line, tail ellipsis (`numberOfLines={1}`).
- Card titles: wrap freely. Descriptions: wrap.
- Journal history excerpts: one line until expanded.
- Week-view block titles: clip.
- Never shrink text to fit (`adjustsFontSizeToFit`) except the focus clock if a locale needs it.
- Respect Dynamic Type up to the platform default maximum. Large text must not overlap the timeline ring: the text column truncates; it does not grow under the ring.
