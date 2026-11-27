import { AmbientSound, isAmbientSound } from '@daycraft/domain';
import { Storage } from 'expo-sqlite/kv-store';

// Device-only, like the onboarding flag (the focus spec's sound decision): the picked ambient
// sound, kept in the key-value store so the next session opens with it selected.
const FOCUS_SOUND_KEY = 'focusSound';

/** The picked sound, or No sound when nothing usable was stored: unreadable counts as never picked. */
export function savedFocusSound(): AmbientSound {
  const stored = Storage.getItemSync(FOCUS_SOUND_KEY);
  return isAmbientSound(stored) ? stored : AmbientSound.NONE;
}

/** Keeps the pick, so setup offers it selected the next time. */
export function saveFocusSound(sound: AmbientSound) {
  Storage.setItemSync(FOCUS_SOUND_KEY, sound);
}
