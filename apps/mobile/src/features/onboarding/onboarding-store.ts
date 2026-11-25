import { Storage } from 'expo-sqlite/kv-store';

// Device-only, like the theme preference: onboarding shows once per device (onboarding doc).
const HAS_ONBOARDED_KEY = 'hasOnboarded';

export function hasOnboarded(): boolean {
  return Storage.getItemSync(HAS_ONBOARDED_KEY) === 'true';
}

export function markOnboarded() {
  Storage.setItemSync(HAS_ONBOARDED_KEY, 'true');
}
