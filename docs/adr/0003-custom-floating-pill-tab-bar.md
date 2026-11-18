# The mobile tab bar is a custom floating pill

> Revised by [ADR-0009](0009-tab-bar-plus-beside-the-pill.md): the + now floats beside the pill instead of inside it. The rest of this decision stands.

The phone app's tab bar is the v2 design's single floating pill: Plan · Habits · **+** · Goals · More, with Plan as the default. It is built with Expo Router `Tabs` and a custom `tabBar`, not `expo-router/native-tabs`. The **+** is a button inside the pill, never a route: it reads the focused route and opens the matching sheet (New task, New task at Anytime on All tasks, New habit, New routine).

## Considered Options

- **Native tabs (`expo-router/native-tabs`):** the system iOS tab bar with Liquid Glass and platform behavior for free. It cannot hold a centered button, so the + would float as a second element and the design's one-pill bar would be lost.

## Consequences

- The design wins over platform convention. Accessibility (roles, labels, selected state), safe-area insets, keyboard avoidance and hiding the bar on Focus are ours to build.
- The bar has the same layout and behavior on iOS and Android; only its glass differs (below).
- Where Liquid Glass is available (iOS 26+), the pill's background is a `GlassView` from `expo-glass-effect`, following the app's theme rather than the OS appearance. Everywhere else it is frosted: an `expo-blur` `BlurView` under an `elevated` veil at 58%, with a light rim and `shadow-float`. On Android the blur needs a `BlurTargetView` around the content, so until one is added the veil sits over a translucent view.
