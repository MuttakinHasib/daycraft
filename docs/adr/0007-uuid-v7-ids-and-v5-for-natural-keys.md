# Ids are UUID v7, and UUID v5 for rows with a natural key

Every row the user creates gets a UUID v7 id. Rows that could be created twice for the same key get a UUID v5 id derived from that key: a habit check-in (habit, date), a journal entry (date) and a repeat occurrence (series, date). The id code lives in `@daycraft/domain`. Each platform passes in its own random bytes (`expo-crypto` on mobile, `crypto.getRandomValues` on web). Feature code treats ids as opaque.

## Considered options

- **Auto-increment integers.** They collide as soon as two devices create rows offline.
- **Random UUID v4.** No time order, and a check-in created on two devices offline would sync as two rows.

## Consequences

- Rows sync without duplicates and with no merge code, and v7 ids sort by creation time.
- Ids are fixed from the first release, before sync exists.
- New mobile dependency: `expo-crypto`.
