# The schema follows the glossary, with three changes to the prototype model

Every glossary term gets its own table, and children (subtasks, routine steps, milestones, check-ins) are rows rather than nested arrays. This differs from the prototype's in-memory model in three ways:

1. **Project tasks are activities.** A project's task is an `activity` with `project_id` set and a `status` of todo, doing or done. There is no separate project-task table. Board columns come from `status`.
2. **Goals link by id.** Related habits and activities point at a goal with a nullable `goal_id`, instead of display-only tags.
3. **Every activity has a date.** `activity_date` is required. A task with no date at all stays an Inbox item. A task with a date but no start time is Unscheduled.

## Consequences

- Board status and `done` can't disagree, and a project's progress is a plain query over activities.
- Domain types keep the prototype's shape; repositories map between those types and the rows.
- "Plan" from the Inbox creates an activity with a date and soft-deletes the Inbox item in one transaction.
