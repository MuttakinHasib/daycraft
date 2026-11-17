import type { CreateCnInput, DefaultClassGroupIds, DefaultThemeGroupIds } from 'cn/config';

import { fontFamilies, TypePreset } from './typography';
import { Radius } from './shape';

/**
 * `createCn` config: without it `text-ink text-micro` drops `text-ink` (unknown `text-*` reads
 * as a color). Built from the token lists, so a new token is never missing.
 */
export const cnConfig: CreateCnInput<DefaultClassGroupIds | 'type-preset', DefaultThemeGroupIds> = {
  extend: {
    classGroups: {
      'font-size': [{ text: Object.values(TypePreset) }],
      'font-family': [{ font: Object.values(fontFamilies).map((family) => family.className) }],
      rounded: [{ rounded: Object.values(Radius) }],
      'type-preset': [{ type: Object.values(TypePreset) }],
    },
    conflictingClassGroups: {
      'type-preset': ['font-size', 'font-family', 'font-weight', 'leading', 'tracking'],
    },
  },
};
