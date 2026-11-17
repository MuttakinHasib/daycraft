# Daycraft mobile

The Expo SDK 58 app (`@daycraft/mobile`) in the Daycraft monorepo. iPhone first, Android second.

```bash
bun install          # from the monorepo root
bunx expo start      # dev server (or `bun run dev`)
bun run check-types  # tsc --noEmit
bun run lint         # expo lint
```

Native modules need a development build (`bunx expo run:ios`). Agent and contributor guidance: [AGENTS.md](AGENTS.md).
