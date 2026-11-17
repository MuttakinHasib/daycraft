# Mobile stores everything in local SQLite through Drizzle; sync comes later

The phone app reads and writes only a local `expo-sqlite` database, through Drizzle ORM inside `apps/mobile/src/data/`. Screens read live queries; there is no state library and no screen waits on the network. v1 ships with no account and no sync. Every synced table already carries `id`, `created_at`, `updated_at` and `deleted_at`, and writes go through repository functions, so the Hono API and the row-level sync planned in [the architecture plan](../architecture-plan.md) (M2, M3) can be added without changing screens.

## Considered Options

- **Remote API with a client cache:** the timeline would depend on the network, and a solo developer would have to run a backend before the first release.
- **A sync product (PowerSync, ElectricSQL) or WatermelonDB now:** more to learn and pay for before there is anything to sync. PowerSync stays the fallback if hand-written sync fails its timebox.
- **op-sqlite:** faster, but not an Expo module, and speed is not a problem at about 100 rows a day.

## Consequences

- No loading states for data on mobile, and the app works offline from day one.
- New dependencies: `drizzle-orm`, `drizzle-kit`, and what Drizzle's Expo migrator needs (`babel-plugin-inline-import`, Metro's `sql` extension).
- First task: prove that Drizzle works with SDK 58, the React Compiler and Uniwind's Metro wrapper. If it doesn't, use raw `expo-sqlite` behind the same repository functions.
