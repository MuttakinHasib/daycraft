import type { FocusTimer } from './focus';

/** The ambient sounds Focus offers: the five bundled loops, plus the silent choice. */
export const AmbientSound = {
  /** The "No sound" choice: Focus stays silent. */
  NONE: 'none',
  RAIN: 'rain',
  FOREST: 'forest',
  CAFE: 'cafe',
  WAVES: 'waves',
  BROWN_NOISE: 'brown-noise',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type AmbientSound = (typeof AmbientSound)[keyof typeof AmbientSound];

/** The picker's five sounds, in the order the spec lists them, without the silent choice. */
export const AMBIENT_SOUNDS: readonly AmbientSound[] = [
  AmbientSound.RAIN,
  AmbientSound.FOREST,
  AmbientSound.CAFE,
  AmbientSound.WAVES,
  AmbientSound.BROWN_NOISE,
];

const ambientSounds: ReadonlySet<unknown> = new Set(Object.values(AmbientSound));

/** Whether a stored sound choice is one Focus offers; unreadable values are not. */
export function isAmbientSound(value: unknown): value is AmbientSound {
  return ambientSounds.has(value);
}

const AMBIENT_SOUND_NAMES: Record<AmbientSound, string> = {
  [AmbientSound.NONE]: 'No sound',
  [AmbientSound.RAIN]: 'Rain',
  [AmbientSound.FOREST]: 'Forest',
  [AmbientSound.CAFE]: 'Café',
  [AmbientSound.WAVES]: 'Waves',
  [AmbientSound.BROWN_NOISE]: 'Brown noise',
};

/** The choice's name as the picker shows it. */
export function ambientSoundName(sound: AmbientSound): string {
  return AMBIENT_SOUND_NAMES[sound];
}

/** What the play rule is decided from: the live timer, the app's foreground state, and the chosen sound. */
export interface AmbientSoundPlayingInput {
  /** The live timer, or null when no session is running: setup, or once it has ended. */
  timer: FocusTimer | null;
  /** Whether the app is in the foreground; the sound pauses when it is not. */
  foregrounded: boolean;
  /** The chosen ambient sound, from the picker. */
  sound: AmbientSound;
}

/**
 * Whether the ambient sound should be playing (the spec's rule): while the session runs and the app
 * is in the foreground, and never in setup, past the end, in a pause, in the background, or for the
 * **No sound** choice.
 */
export function ambientSoundPlaying({ timer, foregrounded, sound }: AmbientSoundPlayingInput): boolean {
  return sound !== AmbientSound.NONE && foregrounded && timer !== null && timer.pausedAt === null;
}
