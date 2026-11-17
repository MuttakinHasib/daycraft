# Status, discrepancies and open decisions

The one place that records where code, tokens and design disagree, and what is decided versus open. Other docs link here. Update it when you close or discover a gap.

Last reviewed 2026-11-17, after the move into the monorepo: `bun run check-types`, `bun run lint` and `bun run build` pass.

## Sources of truth (in priority order)

1. **`src/app/globals.css`**: once the Daycraft tokens are wired in, it is what the app renders. **Today it is still the Next.js template**, so for now the reference CSS below is the only source.
2. **Design system v1.1**:
   - Canvas page “v2 · Refined” → board “Design system v1.1 + refinement log”.
   - Mirrored as CSS in [design/reference/daycraft-tailwind-v1.1.css](design/reference/daycraft-tailwind-v1.1.css).
   - This file was written for exactly this stack (Tailwind v4 on the web, `.dark` class), so it can become `globals.css` almost verbatim.
3. **Desktop prototype**: canvas boards “v2 · Desktop 1440”, “v2 · Tablet 768”, “v2 · Large desktop 1920 · light”. Phone boards (“v2 · iPhone …”) define the modules the desktop has not designed yet. All of them are exported as screenshots and a runnable prototype in [design/reference/](design/reference/README.md).
4. **The mobile app** (`apps/mobile`) shares token names, values, product behavior and vocabulary. If the two apps disagree on a token, design system v1.1 wins and the other app gets fixed.

The canvas page “v1 · Original” is superseded. Do not copy values from it.

## Implementation status

| Area | State |
|---|---|
| Monorepo: this app is `apps/web` (`@daycraft/web`) in the Daycraft Turborepo, with bun workspaces and one root `bun.lock`. ESLint now ignores `docs/**` (vendored prototype bundles failed lint). | Done 2026-11-17. `turbo run build check-types lint` passes. |
| Next.js 16.4 App Router, React 19.3, TypeScript strict, `@/*` → `src/*` | Done (template) |
| Tailwind v4 via the `@tailwindcss/turbopack` loader in `next.config.ts` (no PostCSS config) | Done (template) |
| `cacheComponents`, `partialPrefetching`, `reactCompiler`, `experimental.agentFeedback` | Enabled in `next.config.ts` |
| Daycraft tokens in `globals.css` | **Not done.** The file is the template (`--background`/`--foreground`, `prefers-color-scheme`, Arial body) |
| Plus Jakarta Sans | **Not done.** `layout.tsx` loads Geist / Geist Mono |
| Metadata, favicon, brand | **Not done.** Title is “Create Next App”; favicon and `public/*.svg` are template |
| `src/app/page.tsx` | Template (uses `zinc-*`, arbitrary hex values). Replace, do not extend. |
| Components, domain, data, screens | Not started |
| Tests | Not set up |

## First implementation steps (in order)

1. Replace `globals.css` with the v1.1 reference tokens:
   - keep the `@import "tailwindcss"`;
   - keep `@custom-variant dark`, the `:root` / `.dark` variables, `@theme inline`, `@theme`, and the base and components layers;
   - remove the template variables.
2. Load **Plus Jakarta Sans** with `next/font/google` (weights 400–800, `variable: "--font-sans"` or wired into `--font-sans` via `@theme inline`). Drop Geist.
3. Theme switching without a flash (see [theming](design/theming.md)).
4. Root metadata and favicon from the Daybreak logo package.
5. Domain layer and timeline layout function with tests, then the Today screen.

## Open decisions

| ID | Question | Options | Current lean |
|---|---|---|---|
| W1 | Data & mutations | Server Components + Server Actions against a backend, a client data library against an API, or local-first in the browser | Proposed, not accepted: static export + TanStack Query against the shared Hono API (root [architecture-plan](../../../docs/architecture-plan.md)). Must match mobile D2. Keep domain logic pure until it is accepted. |
| W2 | Theme persistence | `localStorage` + inline pre-paint script, or a cookie read on the server | Proposed: cookie, so the server renders the right class without a flash (see [theming](design/theming.md)). |
| W3 | Widths below 768 | The web app is designed for 768–1920. Below 768: reuse the phone layouts, or show a reduced layout plus a prompt to use the app | Undecided. Pages must still not break or overflow horizontally at 375. |
| W4 | Icon set | Prototype icons are 24 grid, 1.9 stroke, round caps (close to Lucide) | Undecided. Must stay consistent with the mobile app's choice (mobile D4). |
| W5 | Desktop screens other than Today | Only Today is designed for desktop | Proposed: reuse the sidebar + main + right-panel pattern; phone sheets become the right panel or centered dialogs. Design review required per screen. |
| W6 | Delete confirmation | Prototype deletes immediately with a toast | Proposed: toast with Undo (shared with mobile D5). |
| W8 | Keyboard rescheduling on desktop | The desktop detail panel has Duration but no start-time stepper | Required before launch: add the −15 / +15 stepper (as in the phone editor) or keyboard capsule moves (timeline guide §14). |
| W7 | Sharing code and tokens with mobile | Both apps now live in one monorepo, but token CSS and domain logic are still duplicated | Proposed: shared `packages/domain` for pure logic (see the root architecture plan). Token CSS stays in sync by hand until drift shows up. |

Record each resolved decision as an ADR in the monorepo root `docs/adr/` (see the root `docs/agents/domain.md`) and update this table.
