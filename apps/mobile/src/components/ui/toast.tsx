import { durations, easing } from '@daycraft/design-tokens';
import { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import { FullWindowOverlay } from 'react-native-screens';

import { Icon } from './icon';

// A toast answers an action: one at a time, above the tab bar, gone after 2.4 seconds (interaction patterns).
const VISIBLE_MS = 2400;
// The tab bar sits 24 from the bottom and is 60 tall; the toast floats 20 above it.
const TOAST_BOTTOM = 104;

type ShowToast = (message: string) => void;

interface ToastProviderProps {
  children: ReactNode;
}

interface ToastState {
  id: number;
  message: string;
}

const ToastContext = createContext<ShowToast | null>(null);

const enter = FadeIn.duration(durations.toastIn).easing(Easing.bezier(...easing.snap));

/** Shows a toast. Each call replaces the toast on screen. */
export function useToast(): ShowToast {
  const show = use(ToastContext);
  if (!show) throw new Error('useToast must be used inside <ToastProvider>.');
  return show;
}

// iOS shows native form sheets above the app, so the toast renders in a full-window overlay to stay on top.
function Overlay({ children }: ToastProviderProps) {
  if (Platform.OS === 'ios') return <FullWindowOverlay>{children}</FullWindowOverlay>;
  return children;
}

/** The one app-wide toast host. */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const nextId = useRef(0);

  const show: ShowToast = (message) => {
    nextId.current += 1;
    setToast({ id: nextId.current, message });
    AccessibilityInfo.announceForAccessibilityWithOptions(message, { queue: true });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext value={show}>
      {children}
      {toast && (
        <Overlay>
          <View pointerEvents="none" style={{ bottom: TOAST_BOTTOM }} className="absolute inset-x-5 items-center">
            <Animated.View
              key={toast.id}
              entering={enter}
              exiting={FadeOut.duration(durations.press)}
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
              className="h-10 max-w-full flex-row items-center gap-2 rounded-full bg-ink px-4 shadow-float"
            >
              <Icon name="check" size={15} strokeWidth={2.8} colorClassName="text-canvas" />
              <Text numberOfLines={1} className="shrink text-sm font-sans-semibold text-canvas">
                {toast.message}
              </Text>
            </Animated.View>
          </View>
        </Overlay>
      )}
    </ToastContext>
  );
}
