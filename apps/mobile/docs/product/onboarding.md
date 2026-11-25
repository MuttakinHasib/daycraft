# Onboarding

The first run: the animated splash, a three-beat story about the problem, then four short setup steps that end on the real Plan screen. About a minute, and every step can be skipped. Phone only; the web app has no onboarding yet.

**Status:** built except Habits (2026-11-25). The splash, the intro story, Day edges, One thing, Place it and the Ready toast are in `src/features/splash/` and `src/features/onboarding/`; the flow's rules are in `packages/domain/src/onboarding/`. Habits waits for the Habits slice, so the counter reads "Step N of 3". Checked on 2026-11-26 in light and dark at 390×844 and 375×812, with Reduce Motion on, and that Done and Skip end on Plan from a first run and from Replay. The screens follow the canvas: page "v3 · Clean", board "v3 · Onboarding · light (splash → setup)" (interactive, with a Start tweak per step), board "18 · Splash animation", and the "Onboarding spec" board on the page "Splash & onboarding".

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

Bold words are the headline highlight: a soft marker in the step's hue (sky, rose and sage for the intro beats; amber for Day edges, iris for Habits, clay for One thing, pine for Place it). Setup steps show "STEP N OF 4" (label style) above the 30pt headline ("Step N of 3" until the Habits step exists). The header is **‹ Back** in the accent text colour (top left; hidden on the first beat) and **Skip** in muted ink (top right). The CTA is a full-width primary button 16pt from the sides, floating over the sheet with the float shadow. Back on Day edges returns to the last intro beat.

## Splash

See [design-system](../../../../docs/design/design-system.md#brand) for the exact timings. The native launch screen shows only the background (`#FFFFFF`, dark `#111111`); `AnimatedSplash` builds the mark over it once the database is ready: the blue block and green chip drop in, the pen slides up, the sun rises and its rays pop, the wordmark fades up, then everything fades out. Reduce Motion shows the full lockup and only fades.

After the splash: Onboarding if `hasOnboarded` is not set, otherwise Plan.

## Intro (three beats, one screen)

The story of why a list is not a plan. Back steps through the beats. Three dots above the CTA show the beat (the current one a 22pt accent pill); they fade on the last beat. The story is decoration: hidden from screen readers, which hear the headlines.

1. **Problem.** "Your list looks short." / "But a list never says how long each thing takes." Five plain checklist rows slide in, 40 ms apart.
2. **Cost.** "That's 6 hr 30 min." / "You have 5 hours left today." Each row stretches to its real length in its colour while the headline counts up (0.75 s stretch, 90 ms stagger, 1 s count). A dashed "5 hr left today" line drops in; the item past it fades.
3. **Answer.** "Daycraft gives each one a time." / "What fits goes on today. What doesn't moves to tomorrow." The blocks reflow into timeline capsules with times and check rings, ending in "30 min free"; the one that does not fit shrinks into a "Moved to tomorrow" tray (0.75 s reflow, labels at 650 ms).

The example items are fixed demo content (for example Finish the slides 2 hr, Groceries 45 min, Gym 1 hr, Clean the kitchen 45 min, Plan the trip 2 hr); they are not saved. So are the hours: "6 hr 30 min" against "5 hr left today" is the story's own copy and does not follow the clock, because the dashed line, the faded item and "30 min free" all depend on those numbers.

## 1 · Day edges

"When does your day start and end?" / "Drag Rise and shine and Wind down, or use the buttons."

- The Plan sheet slides up (0.55 s, ease-out) with a real timeline holding two routines, **Rise and shine** (alarm icon) and **Wind down** (moon icon), as point-in-time capsules, with the spine and the free-time hint between them ("16 hr to plan").
- Drag either one, or use the − / + buttons at the right of its row (they replace the check ring on this step). The whole day is fitted into the sheet on this step so both routines stay in view. Both snap to **15 minutes**, with a light haptic on each snap. The drag label pill is the timeline's own.
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

- A 48pt capture pill on the canvas: spark icon, placeholder "Name one thing…", a 1pt border that turns accent once there is a title, and an accent check circle at the right end.
- "IDEAS" label, then chips that wrap: icon in the idea's hue, title, and its length at 70% opacity. The picked chip is ink with canvas text. Each sets the title, icon, colour and length: Deep work 1 hr 30 min (laptop, clay), Workout 45 min (dumbbell, sage), Groceries 45 min (cart, pine), Call Mom 30 min (phone, iris), Laundry 1 hr (home, slate), Read a chapter 30 min (book, amber).
- A typed title gets the default length, 1 hr, colour clay, and the icon its last matching word suggests ("Morning run" gets run, not alarm). Typing an idea's exact title counts as picking it.
- The sheet slides down out of the way on this step; the CTA rides above the keyboard.
- "Add to timeline" is disabled until the title is not blank.

## 4 · Place it

"Put it on your timeline." / "Drag it to move it. Drag its bottom edge to change how long it takes."

- The sheet slides back up with the task popping in, scrolled into view. It lands at the **first free 15-minute slot after now** (now plus 5 minutes, rounded up to 15), not before Rise and shine, stepping past anything already on today (a routine blocks 10 minutes) and ending by Wind down. When nothing fits it lands at now plus 5, kept inside the day edges (`placeTask`).
- The timeline shows the now line, the free-time hints and anything already on today; routines keep no − / + here.
- Same move, resize grip, drag label and 5-minute snapping as Plan ([timeline-guide](timeline-guide.md)): it is the Plan timeline. Only the Day edges step snaps to 15 minutes. Only the task can be dragged here: the routines and anything else already on the day are context, and their capsules do not tell screen readers to drag them. No toast follows a drag on this step.
- The task's capsule offers the drag as accessibility actions: move 15 minutes earlier or later, shorten by 15 minutes or extend by 15 minutes. The new time is announced. Keyboard arrows do not move it.

## Ready

The real Plan screen on today: date header, progress ring, week strip, habit strip (once habits exist), and the timeline from Rise and shine through the task (which pops in) to Wind down ([timeline-guide §2](timeline-guide.md#2-time-scale-and-range)). Plan lands as [timeline-guide §11](timeline-guide.md#11-scrolling) says, so the new task is in view; onboarding covers the whole tab bar, so it asks Plan to land again rather than waiting for Plan to do so when it closes. Toast "Today is set up" with a **Replay** action (a small accent pill inside the toast) that opens onboarding again. Skip shows no toast and ends on Plan too, as Replay does from whichever tab it was opened: onboarding is dismissed down to Plan (`router.dismissTo('/')`), or replaced by Plan when it is the only screen.

## What it saves

**Done** writes, in one transaction:

- Rise and shine and Wind down as daily routines (on replay, the existing two are moved for all future days instead of added again);
- the chosen habits (daily);
- the one task on today, at its placed start and length.

**Skip** goes straight to Plan with the two routines at whatever was set so far (7:00 AM and 11:00 PM by default) and no half-made task. It is the same save without the task.

A save that fails writes nothing. Onboarding stays open on its step with "Couldn't save today. Try again." above the button, which is tapped again to retry; Back takes the message away.

Then `hasOnboarded` is stored locally (`expo-sqlite/kv-store`, like the theme preference). More gets a **Replay onboarding** row; replay never deletes data, it only adds.

## Accessibility and motion

- Every gesture has a non-drag equivalent: the − / + buttons on the two routines, accessibility actions on the task, plain rows for habits.
- Headline highlights are decoration; screen readers hear the plain sentence.
- Reduce Motion: the sheet jumps between positions instead of sliding, the intro shows each beat's end state, and the splash only fades.

## Build notes

- Route: `src/app/onboarding.tsx`, a full-screen modal above `(tabs)`, pushed by the root layout under the splash on first launch and by **Replay onboarding** in More.
- `features/onboarding/onboarding-screen.tsx` runs the intro beats itself (they save nothing) and the setup steps through `onboardingReducer` in `@daycraft/domain` (screens, CTA text and enablement, `placeTask`, the outcome to save). Its other files: `headline.tsx`, `intro-story.tsx` (Reanimated, 0.75s moves with the canvas staggers) and `one-thing.tsx`.
- One sheet stays mounted: its top follows the headline's bottom and animates over 0.55s (`cubic-bezier(.2,.8,.2,1)`); Reduce Motion jumps.
- The sheet holds Plan's own `Timeline` with an onboarding data source. Day edges draws the two routines from the draft, fits the day, snaps to 15 with a haptic per step, and passes `renderAccessory` for the − / +. Place it uses Plan's `useTimelineDrag` at 5 minutes, with `isDraggable` limiting it to the task and `hasDragActions` giving the task its accessibility actions.
- Done and Skip save through `activityRepository.saveOnboarding`, one transaction for the edges and the task; a failed write saves nothing. Each outcome is saved once. Onboarding then ends on Plan with `router.dismissTo('/')` (`navigate` would move Plan above onboarding and leave onboarding in the stack), and Plan is asked to land again (`requestLanding` in `plan-state.ts`).
- The toast takes an optional action (`toast(message, { label, onPress })`), used for Replay.
