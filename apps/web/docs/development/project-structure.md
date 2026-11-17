# Project structure

## Current tree (`apps/web`, 2026-11-17)

```text
.
├── AGENTS.md              # agent entry point (CLAUDE.md imports it; contains next-managed blocks)
├── package.json           # @daycraft/web; scripts dev, build, check-types, lint
├── next.config.ts         # cacheComponents, partialPrefetching, reactCompiler, agentFeedback, Tailwind turbopack loader
├── eslint.config.mjs      # next core-web-vitals + typescript
├── tsconfig.json          # strict, @/* → src/*
├── public/                # template SVGs (next, vercel, file, globe, window): replace with Daycraft assets
├── docs/
│   ├── product/           # product overview, navigation, timeline, interactions (mobile counterpart in apps/mobile)
│   ├── design/            # tokens, type, spacing, components, theming, responsive, a11y
│   │   └── reference/     # design system v1.1 CSS (the tokens to wire into globals.css)
│   ├── development/       # architecture, structure, conventions, testing
│   └── status-and-decisions.md
└── src/app/
    ├── layout.tsx         # template: Geist fonts, metadata “Create Next App”
    ├── page.tsx           # template page
    ├── globals.css        # template tokens
    └── favicon.ico        # template
```

`GLOSSARY.md`, `docs/agents/`, `docs/adr/` (created lazily) and `.scratch/` (the issue tracker, created lazily) live at the monorepo root, not in this app.

## Target structure (grow into it; no empty scaffolding)

```text
src/
  app/
    layout.tsx               # html/body, fonts, theme class, Toast provider
    globals.css              # Daycraft tokens (from docs/design/reference)
    (app)/layout.tsx         # sidebar + main shell
    (app)/page.tsx           # Today
    (app)/<module>/page.tsx  # see navigation-and-modules.md
  features/
    shell/                   # Sidebar, NavItem, rail behavior
    today/                   # DateHeader, WeekStrip, HabitChips, Timeline/*, DetailPanel, DailyProgress, UpNext, InboxCard
    inbox/ calendar/ upcoming/ tasks/ habits/ routines/ goals/ projects/ focus/ journal/
  components/ui/             # Button, IconButton, Chip, Tag, Segmented, CheckRing, Capsule, TextField, Card, ListGroup, ProgressRing, Toast, Dialog, EmptyState, SectionLabel
  domain/
    time.ts
    timeline/                # layout-day.ts, time-map.ts, gaps.ts, slots.ts, snapping.ts, next-free-slot.ts
    activity.ts habit.ts routine.ts goal.ts project.ts journal.ts inbox.ts
  data/                      # repositories / server data access (W1)
  hooks/                     # cross-feature hooks: use-now.ts, use-selected-date.ts
```

Move code up a level only when a second feature needs it:

- visual → `components/ui`;
- logic → `domain`;
- cross-cutting hooks → `hooks`.

## Naming

| Thing | Convention | Example |
|---|---|---|
| Files | kebab-case | `week-strip.tsx`, `layout-day.ts` |
| Next special files | as Next requires | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `[projectId]` |
| Components | PascalCase named exports (default export only where Next requires it) | `export function WeekStrip` |
| Hooks | `useX` in `use-x.ts` | `useNow` |
| Props | `interface XProps` beside the component | `interface ChipProps` |
| Domain functions | descriptive verbs | `layoutDay`, `findNextFreeSlot`, `formatTimeRange` |
| Constants | `SCREAMING_SNAKE_CASE`; `as const` objects for enum-likes | `DAY_START_MINUTES`, `ActivityHue` |
| Tests | `*.test.ts(x)` beside the file; e2e in `e2e/` | `layout-day.test.ts` |
| Domain terms | [vocabulary](../product/product-overview.md#vocabulary) | `Activity`, `Capsule`, never `Item` or `Event` for everything |
