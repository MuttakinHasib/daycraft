# Repeat is an RRULE subset on a series, and each occurrence is a real activity

A repeating activity is an `activity_series` row whose `rrule` holds a small RFC 5545 subset (`FREQ`, `INTERVAL`, `BYDAY`). Each occurrence is an ordinary `activity` row, with an id derived from the series and the date. The parser and expander live in `@daycraft/domain`, so every client creates the same rows. Completion and subtasks belong to one occurrence. Changing an occurrence's title, time, length, hue, icon or Repeat asks where the change goes: **this task only** (the occurrence is detached), **all future tasks** (the series from that date onward) or **all tasks** (the whole series). Deleting asks the same. _Amended 2026-11-19: this replaces "editing one occurrence changes only that occurrence, and the editor never asks"._

## Considered options

- **Expand the rule on every read.** Every query would become "stored rows plus expanded rules minus exceptions", written once for SQL on the phone and again for the API. Completion, drag and subtasks are per occurrence, so each occurrence needs a row anyway.
- **The `rrule` npm package.** It works on UTC `Date`s, which conflicts with Daycraft's floating local dates, and it supports far more than the four presets need.

## Consequences

- Every read is a plain date filter.
- Deleting one occurrence leaves a tombstone, so it is not created again.
- "This task only" detaches the occurrence. "All future tasks" rewrites occurrences from that date on, "all tasks" rewrites every occurrence; both skip occurrences that are detached or done.
- Habit frequency ("4× a week") is a target, not a rule, and does not use this.
