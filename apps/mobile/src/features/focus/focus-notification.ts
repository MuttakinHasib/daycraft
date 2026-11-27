import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import type { Href } from 'expo-router';
import { AppState, Platform } from 'react-native';

/**
 * The session-end notification, over `expo-notifications` (~58.1.10, the version the Expo 58 docs
 * recommend): the Expo SDK's own module for scheduling local notifications, so it fits the app's
 * existing Expo modules and CNG build, and it owns date triggers, permissions and response routing.
 * The domain owns the scheduling decision (`focusEndNotificationAt`): when it should fire and
 * whether one should be scheduled at all. This module owns the device behaviour the OS holds: the
 * permission, the schedule and its cancellation, and what a tap on the notification opens.
 * Needs a development build — the module is native code no Expo Go build includes.
 */

// The tray's announcement, in the design reference's own words for the moment the timer runs out
// (prototype/desktop-light.html toasts "Focus session complete"), so no string of ours is new.
const END_TITLE = 'Focus session complete';

// Android delivers every scheduled notification through a channel (the docs' rule), upserted before
// each use so the permission prompt and the delivery both find it. The name is the module's own.
const CHANNEL_ID = 'focus';
const CHANNEL_NAME = 'Focus';

// While the app is in front its own screen already shows the end, so the banner and the tray entry
// stay quiet; whenever the app is not active the system presents the notification untouched.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: AppState.currentState !== 'active',
    shouldShowList: AppState.currentState !== 'active',
  }),
});

/** The one channel the end notification is delivered through; a no-op off Android. */
async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: CHANNEL_NAME,
    importance: AndroidImportance.DEFAULT,
  });
}

// The pending notification's identifier: what a length change or an end replaces.
let scheduledId: string | null = null;

// One device operation at a time — a quick −5, +5 pair must not interleave a cancel with a schedule
// and leave two notifications pending. A failed operation is swallowed (notification trouble must
// never disturb the session) and never blocks the one queued behind it.
let queued: Promise<unknown> = Promise.resolve();
async function quietly(operation: () => Promise<void>): Promise<void> {
  try {
    await operation();
  } catch {
    // Nothing to do: the session goes on without its announcement.
  }
}
function oneAtATime(operation: () => Promise<void>): Promise<void> {
  const run = queued.then(() => quietly(operation));
  queued = run;
  return run;
}

/** Whether the permission is still undecided — the state in which setup shows its short reason. */
export async function focusNotificationUndetermined(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  return !settings.granted && settings.canAskAgain;
}

/** Whether the end notification is already allowed, without asking: a restored session keeps its own. */
export async function focusNotificationsGranted(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  return settings.granted;
}

/**
 * The permission for the end notification, asked once (the spec's rule) on the first session start,
 * after the reason has shown. Granted stays granted; a denial is never asked over; only an
 * undecided device sees the OS prompt — which Android 13+ shows no trace of before a channel
 * exists. Declining leaves Focus working with no notification.
 */
export async function requestFocusNotifications(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  await ensureChannel();
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/** What scheduling the end notification needs: the domain rule's fire time, and where a tap returns. */
export interface ScheduleFocusEndInput {
  /** When the domain's rule says the session ends, in epoch milliseconds. */
  fireAt: number;
  /** The activity the session focuses on, or null when it has none: the route a tap returns to. */
  activityId: string | null;
}

/** Schedules the end notification at the fire time, replacing any pending one. */
export function scheduleFocusEndNotification({ fireAt, activityId }: ScheduleFocusEndInput): Promise<void> {
  return oneAtATime(async () => {
    if (scheduledId !== null) {
      await Notifications.cancelScheduledNotificationAsync(scheduledId);
    }
    await ensureChannel();
    scheduledId = await Notifications.scheduleNotificationAsync({
      content: { title: END_TITLE, data: { focusEnd: true, activityId } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(fireAt),
        channelId: CHANNEL_ID,
      },
    });
  });
}

/** Cancels the pending end notification: a pause, an end, or a close leaves nothing to fire. */
export function clearFocusEndNotification(): Promise<void> {
  return oneAtATime(async () => {
    if (scheduledId === null) return;
    await Notifications.cancelScheduledNotificationAsync(scheduledId);
    scheduledId = null;
  });
}

/**
 * Cancels every pending end notification: a recovered session ended at its last recorded time, so
 * the announcement scheduled for its planned end must not fire after the fact. All rather than the
 * identifier because a kill between scheduling and reopening loses it.
 */
export function cancelAllFocusEndNotifications(): Promise<void> {
  return oneAtATime(async () => {
    scheduledId = null;
    await Notifications.cancelAllScheduledNotificationsAsync();
  });
}

/** Whether a response is a tap on the end notification rather than some other one. */
function isFocusEndResponse(response: Notifications.NotificationResponse): boolean {
  return response.notification.request.content.data?.focusEnd === true;
}

/**
 * The response that opened the app when it came from the end notification, or null when it did not:
 * the cold-launch half of the docs' routing pattern, read once beside the response listener below.
 */
export function focusEndLaunchResponse(): Notifications.NotificationResponse | null {
  const response = Notifications.getLastNotificationResponse();
  return response !== null && isFocusEndResponse(response) ? response : null;
}

/**
 * Runs for a tap on the end notification while the app is already running — backgrounded and
 * foregrounded alike, where a cold launch is not what brings it back (the docs pair this listener
 * with the launch read above). Returns the unsubscribe.
 */
export function addFocusEndResponseListener(handle: (response: Notifications.NotificationResponse) => void): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    if (isFocusEndResponse(response)) handle(response);
  });
  return () => subscription.remove();
}

/** Where the end notification's tap returns: Focus on the session's activity, at its Done state. */
export function focusEndRoute(response: Notifications.NotificationResponse): Href {
  const data = response.notification.request.content.data;
  const activityId = typeof data?.activityId === 'string' ? data.activityId : null;
  return activityId === null ? '/focus' : { pathname: '/focus/[activityId]', params: { activityId } };
}

/** Consumes the launch response, so a later one cannot route the same tap twice. */
export function clearFocusEndLaunchResponse(): void {
  Notifications.clearLastNotificationResponse();
}
