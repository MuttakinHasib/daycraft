# Typography

## Typeface

**Onest** (design system v2, [ADR-0008](../../../../docs/adr/0008-visual-direction-clean.md)), loaded with `next/font/google` in `src/app/layout.tsx`:

- variable font; UI uses 400, 500 and 600 only;
- `subsets: ["latin"]`;
- `display: "swap"`;
- exposed as `--font-onest`, which the generated token CSS maps to `--font-sans`.

Read `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md` before changing the font setup.

The web font provides real weights (the mobile app instead picks one font family per weight), so use Tailwind's `font-normal`/`font-medium`/`font-semibold` together with the type tokens. Nothing in the UI is bolder than semibold.

Use `tabular-nums` for times, durations, counts, percentages, the week strip and the focus clock.

## Scale

Generated from `typeScale` in `@daycraft/design-tokens`: `--text-*` variables (with line height, tracking and weight) and a `type-*` utility per preset. Prefer `type-display`, `type-body`, … so class names match the mobile app; `text-display` still works.

| Utility | Size / line | Tracking | Weight | Use |
|---|---|---|---|---|
| `text-display` | 30 / 1.1 | −0.03em | 600 | Page titles; the desktop Today date header |
| `text-date` | 27 / 1.15 | −0.03em | 600 | Phone Today header (not used on desktop) |
| `text-title` | 24 / 1.15 | −0.025em | 600 | Secondary titles (project detail), “Session complete” |
| `text-heading` | 20 / 1.25 | −0.015em | 600 | Panel/dialog titles, the detail title input, empty states, Calendar header |
| `text-activity` | 16 / 1.35 | −0.01em | 600 | Activity titles, card titles, panel section titles (“Up next”, “Daily progress”) |
| `text-body` | 15 / 1.5 | 0 | 400–500 | Body copy, inputs, buttons (semibold) |
| `text-body-sm` | 14 / 1.45 | 0 | 500 | Subtitles, descriptions, notes, nav labels (600) |
| `text-control` | 13 / — | 0 | 500 | Chips, segmented controls |
| `text-meta` | 12.5 / 1.35 | 0 | 500 | Time ranges, counts, secondary lines |
| `text-label` | 12 | +0.06em, uppercase | 600 | Section labels (“HABITS”, “GROW”) |
| `text-micro` | 11 | 0 | 500 | Timeline gutter, weekday labels, tiny captions |
| `text-clock` | 56 | −0.03em | 500 | Focus timer (the desktop inline timer uses 30 / 600) |

Do not use Tailwind's default `text-sm`/`text-lg`/… sizes for UI copy. Map stray values to the nearest token:

- 13.5 → body-sm;
- 14.5 → body;
- 17–19 → activity or heading;
- 22–26 → heading or title;
- 32 → display.

## Weight

- **800:** display, date, title, heading, numerals in rings and the week strip.
- **700:** activity titles, buttons, labels, tags.
- **600:** controls, nav labels, micro.
- **500:** body, body-sm, meta.

Emphasis comes from color contrast (`ink` vs `ink-muted`), not extra bold.

## Color pairing

| Role | Class |
|---|---|
| Primary | `text-ink` |
| Secondary | `text-ink-muted` |
| Tertiary / placeholders | `text-ink-subtle` |
| Accent text | `text-accent-text` |
| On accent | `text-on-accent` |
| On hue | `text-on-hue` (white) |
| Sheet header band | Light: `text-ink` on the 40% tint. Dark: `text-on-hue` on the solid hue |
| Done | `text-ink-subtle line-through` |

## Wrapping

- Timeline titles: one line, `truncate`.
- Detail title input: one line (it scrolls inside the input).
- Cards and descriptions: wrap.
- Never shrink text to fit.
- The UI must survive 200% browser zoom without horizontal page scroll (WCAG 1.4.10 at 1280px wide).
