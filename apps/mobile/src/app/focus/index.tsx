import { FocusScreen } from '@/features/focus/focus-screen';

/** Focus with no activity: the same timer with nothing to tie the session to. */
export default function FocusRoute() {
  return <FocusScreen activityId={null} />;
}
