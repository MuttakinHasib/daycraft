# Onboarding

The first run: the animated splash, a three-beat story about the problem, then four short setup steps that end on the real Plan screen. About a minute, and every step can be skipped. Phone only; the web app has no onboarding yet.

**Status:** partly built. The splash and the Day edges step are built (`src/features/splash/`, `src/features/onboarding/`, 2026-11-25); the intro, One thing and Place it are still to do, so the counter reads "Step 1 of 1" and Continue ends on Plan. The design lives on the canvas: page "v3 · Clean", board "v3 · Onboarding · light (splash → setup)" (interactive, with a Start tweak per step), board "18 · Splash animation", and the "Onboarding spec" board on the page "Splash & onboarding".

## Principles

- **Teach by doing.** The only gestures are the ones used every day afterwards: drag, resize, tap to check.
- **Same components as the app.** The Plan sheet, timeline rows, habit strip, list rows, chips, capture pill, buttons, toast and tab bar are the production components with the same tokens. Onboarding adds no styles beyond the splash.
- **One continuous surface.** The Plan sheet stays on screen and gains content step by step, so the last step is the real Plan.
- **Motion follows input.** Things move because the user moved them, or to carry the task to its next place. No looping decoration, confetti, glows or word-by-word reveals.
- **Plain copy, real numbers.** Questions say what is being set; numbers are real (hours awake, planned, open).
- **No permission screen.** Notification permission is asked the first time something is about to start, when the reason is obvious.

## Flow

| #   | Screen          | Headline                                   | CTA                                                     |
| --- | --------------- | ------------------------------------------ | ------------------------------------------------------- |
| —   | Splash          | (mark + wordmark)                          | — (advances on its own after 2.6s)                      |
| 0a  | Intro · problem | Your list looks **short**.                 | Continue                                                |
| 0b  | Intro · cost    | That's **6 hr 30 min**.                    | Continue                                                |
| 0c  | Intro · answer  | Daycraft gives each one **a time**.        | Set up today                                            |
| 1   | Day edges       | When does your day **start and end**?      | Continue                                                |
| 2   | Habits          | Pick a few **daily habits**.               | Continue (Continue without habits when none are picked) |
| 3   | One thing       | What's **one thing** you want to do today? | Add to timeline (disabled until there is a title)       |
| 4   | Place it        | Put it on your **timeline**.               | Done                                                    |
| —   | Ready           | (the Plan screen)                          | —                                                       |

Bold words are the headline highlight: a soft marker in the step's hue, a different hue on each step. Setup steps show "Step N of 4" above the headline ("Step N of 3" until the Habits step exists). Every screen after the splash has **Back** (top left) and **Skip** (top right).

## Splash

See [design-system](../../../../docs/design/design-system.md#brand) for the exact timings. The native launch screen shows only the background (`#FFFFFF`, dark `#111111`); `AnimatedSplash` builds the mark over it once the database is ready: the blue block and green chip drop in, the pen slides up, the sun rises and its rays pop, the wordmark fades up, then everything fades out. Reduce Motion shows the full lockup and only fades.

After the splash: Onboarding if `hasOnboarded` is not set, otherwise Plan.

## Intro (three beats, one screen)

The story of why a list is not a plan. Back steps through the beats.

1. **Problem.** "Your list looks short." / "But a list never says how long each thing takes." Five plain checklist rows slide in, 40 ms apart.
2. **Cost.** "That's 6 hr 30 min." / "You have 5 hours left today." Each row stretches to its real length in its colour while the headline counts up (0.75 s stretch, 90 ms stagger, 1 s count). A dashed "5 hr left today" line drops in; the item past it fades.
3. **Answer.** "Daycraft gives each one a time." / "What fits goes on today. What doesn't moves to tomorrow." The blocks reflow into timeline capsules with times and check rings, ending in "30 min free"; the one that does not fit shrinks into a "Moved to tomorrow" tray (0.75 s reflow, labels at 650 ms).

The example items are fixed demo content (for example Finish the slides 2 hr, Groceries 45 min, Gym 1 hr, Clean the kitchen 45 min, Plan the trip 2 hr); they are not saved.

## 1 · Day edges

"When does your day start and end?" / "Drag Rise and shine and Wind down, or use the buttons."

- The Plan sheet slides up (0.55 s, ease-out) with a real timeline holding two routines, **Rise and shine** (alarm icon) and **Wind down** (moon icon), as point-in-time capsules, with the spine and the free-time hint between them ("16 hr to plan").
- Drag either one, or use its − / + buttons (two small cards under the headline). The whole day is fitted into the sheet on this step so both routines stay in view. Both snap to **15 minutes**, with a light haptic on each snap. The drag label pill is the timeline's own.
- Defaults: Rise and shine **7:00 AM**, Wind down **11:00 PM**. Both stay inside 5:00 AM to midnight, at least **6 hours** apart.
- Both are saved as routines that repeat **daily**. They are ordinary activities: Plan starts and ends on them, and they are changed later like any repeating activity (the editor asks "this task only, all future tasks or all tasks").

## 2 · Habits

Built after the Habits slice: the app has no habits yet. Until then onboarding has three setup steps ("Step N of 3") and skips this one.


"Pick a few daily habits." / "Up to four. They sit above your timeline as one-tap check-ins."

- List rows with a 32pt hue tile and a check ring: Drink water, Move for 20 minutes, Read, Meditate, Journal, Stretch, No phone in bed, Take vitamins.
- Preselected: Drink water, Read, Meditate. **At most four**; when four are picked, the others dim until one is unticked.
- The sheet's habit strip fills as rows are ticked (items pop in).
- With none picked the CTA reads "Continue without habits".

## 3 · One thing

"What's one thing you want to do today?"

- The Inbox capture pill ("Your task") and idea chips; each chip sets the title, icon, colour and length: Deep work 1 hr 30 min, Workout 45 min, Groceries 45 min, Call Mom 30 min, Laundry 1 hr, Read a chapter 30 min. A typed title gets the default length, 1 hr.
- The sheet steps aside (slides down) while typing.
- "Add to timeline" is disabled until the title is not blank.

## 4 · Place it

"Put it on your timeline." / "Drag it to move it. Drag its bottom edge to change how long it takes."

- The task lands at the **first free 15-minute slot after now** (now plus 5 minutes, rounded up), between Rise and shine and Wind down, with the now line and the free-time hint.
- Same move, resize grip, drag label, 5-minute snapping and toast as Plan ([timeline-guide](timeline-guide.md)): it is the Plan timeline. Only the Day edges step snaps to 15 minutes. Arrow keys move it by 15 minutes; Shift + arrows resize it. Its accessibility actions give the same control without dragging.

## Ready

The real Plan screen: date header, progress ring, week strip, habit strip (once habits exist), and the timeline from Rise and shine through the task to Wind down ([timeline-guide §2](timeline-guide.md#2-time-scale-and-range)); the tab bar fades in. Toast "Today is set up" with a **Replay** action.

## What it saves

**Done** writes, in one transaction:

- Rise and shine and Wind down as daily routines (on replay, the existing two are moved for all future days instead of added again);
- the chosen habits (daily);
- the one task on today, at its placed start and length.

**Skip** goes straight to Plan with the two routines at whatever was set so far (7:00 AM and 11:00 PM by default) and no half-made task.

Then `hasOnboarded` is stored locally (`expo-sqlite/kv-store`, like the theme preference). More gets a **Replay onboarding** row; replay never deletes data, it only adds.

## Accessibility and motion

- Every gesture has a non-drag equivalent: the − / + buttons on the two routines, accessibility actions on the task, plain rows for habits.
- Headline highlights are decoration; screen readers hear the plain sentence.
- Reduce Motion: the sheet jumps between positions instead of sliding, the intro shows each beat's end state, and the splash only fades.

## Build notes

- Proposed route: `src/app/onboarding.tsx` as a full-screen stack screen above `(tabs)`, chosen in the root layout after the splash. Keep it thin; the flow lives in `src/features/onboarding/`.
- Render the real `TimelineSheet`, `HabitStrip` and `ListRow` with an onboarding data source instead of copies. Animate the sheet's top between steps with Reanimated (0.55 s, ease-out).
- The two routines use Gesture Handler pan gestures with 15-minute snapping and `expo-haptics` on each snap; the task uses Plan's own drag (`useTimelineDrag`).
- Needs repeating activities ([ADR-0006](../../../../docs/adr/0006-repeat-as-rrule-subset-with-materialized-occurrences.md)) built first.
