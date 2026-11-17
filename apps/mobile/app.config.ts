/// <reference types="node" />
import path from 'node:path';

import type { ConfigContext, ExpoConfig } from 'expo/config';

// Each weight is its own family; names must match `fontFamilies` in @daycraft/design-tokens.
// iOS reads the name from the file (PostScript name), Android from `fontFamily`.
const FONT_FILES = {
  'PlusJakartaSans-Regular': { file: '400Regular/PlusJakartaSans_400Regular.ttf', weight: 400 },
  'PlusJakartaSans-Medium': { file: '500Medium/PlusJakartaSans_500Medium.ttf', weight: 500 },
  'PlusJakartaSans-SemiBold': { file: '600SemiBold/PlusJakartaSans_600SemiBold.ttf', weight: 600 },
  'PlusJakartaSans-Bold': { file: '700Bold/PlusJakartaSans_700Bold.ttf', weight: 700 },
  'PlusJakartaSans-ExtraBold': { file: '800ExtraBold/PlusJakartaSans_800ExtraBold.ttf', weight: 800 },
} as const;

// Resolved through Node so the path survives workspace hoisting.
function fontPath(file: string): string {
  return path.relative(__dirname, require.resolve(`@expo-google-fonts/plus-jakarta-sans/${file}`));
}

const fonts = Object.entries(FONT_FILES).map(([fontFamily, { file, weight }]) => ({
  fontFamily,
  path: fontPath(file),
  weight,
}));

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'daycraft_app',
  slug: config.slug ?? 'daycraft_app',
  plugins: [
    ...(config.plugins ?? []),
    [
      'expo-font',
      {
        ios: { fonts: fonts.map((font) => font.path) },
        android: {
          fonts: fonts.map(({ fontFamily, path: fontFile, weight }) => ({
            fontFamily,
            fontDefinitions: [{ path: fontFile, weight }],
          })),
        },
      },
    ],
  ],
});
