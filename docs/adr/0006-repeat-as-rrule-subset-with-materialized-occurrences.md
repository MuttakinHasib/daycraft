# Repeat is an RRULE subset on a series, and each occurrence is a real activity

A repeating activity is an `activity_series` row whose `rrule` holds a small RFC 5545 subset (`FREQ`, `INTERVAL`, `BYDAY`). Each occurrence is created as an ordinary `activity` row, with an id derived from the series and the date. The parser and expander live in `@daycraft/domain`, so every client creates the same rows. Editing one occurrence (time, duration, completion) changes only that occurrence, and the editor never asks "this one or all following". Changing Repeat changes the series from that date onward.

## Considered Options

- **Expand the rule on every read:** every query would become "stored rows plus expanded rules minus exceptions", written once for SQL on the phone and again for the API. Completion, drag and subtasks are per occurrence, so each occurrence needs a row anyway.
- **The `rrule` npm package:** it works on UTC `Date`s, which fights Daycraft's floating local dates, and it supports far more than the four presets need.

## Consequences

- Every read is a plain date filter.
- Deleting one occurrence leaves a tombstone, so it is not created again.
- Editing one occurrence detaches it, and series edits rewrite only future occurrences that are not detached or done.
- Habit frequency ("4× a week") is a target, not a rule, and does not use this.
