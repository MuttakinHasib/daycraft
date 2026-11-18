# The + floats beside the tab pill, and the active tab is quiet

The phone tab bar is a glass pill holding four tabs (Plan · Habits · Goals · More) with the + as its own 56 accent circle to the right. The selected tab is a translucent gray pill with an `ink` icon and label. This revises the + placement in [ADR-0003](0003-custom-floating-pill-tab-bar.md); the custom `tabBar` and everything else there stands.

## Context

With the + inside the pill, the bar carried three unrelated treatments: glass, a solid ink disc filling the pill's height, and a solid accent pill for the active tab. Next to each other the disc and the active pill competed, the + split the tabs into two pairs, and bright timeline blocks smeared through the 58% veil. On white screens the light bar barely separated from content.

## Considered Options

Five variants were compared on the design canvas (v3 page, "Tab bar A–E"):

- **A (previous):** + inside, solid accent active tab.
- **B:** + inside, pale accent active tab, warmer glass.
- **C (chosen):** four-tab pill with a separate accent + circle; quiet active tab; mostly opaque glass and a `canvas` fade.
- **D:** + inside as a smaller accent circle; quiet active tab.
- **E:** like C with icon-only tabs; cleanest, but unlabeled tabs are harder to learn.

## Decision

C. One colored element per bar (the +), one quiet location indicator, one continuous row of tabs for the selection to glide along. It follows the iOS 26 pattern of a tab bar with a separate accessory button.

## Consequences

- The `glass` token gains `selection`, `fadeHeight` and `fadeSolidStop`; its veil is per scheme (`surface` 88% light, `elevated` 82% dark) and its rim is a hairline in light.
- A `canvas` fade sits behind the bar, so screens keep their bottom padding for the bar (`pb-30`). The bar sits 24 from the screen's bottom edge, over the home indicator, as the design shows.
- The + is a 56 accent circle; it is still a button, never a route.
