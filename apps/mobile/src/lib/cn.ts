import { createCn } from 'cn/config';

/**
 * `cn` taught Daycraft's custom token names. Without them it reads `text-micro` as a text
 * color (and drops `text-ink` next to it) and never resolves `rounded-capsule` against
 * `rounded-full`. Keep these lists in step with the tokens in `src/global.css`; ticket 02
 * moves them into `@daycraft/design-tokens` so the list lives next to the values.
 */
export const cn = createCn<'type-preset'>({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'date', 'heading', 'activity', 'body', 'meta', 'label'] }],
      'font-family': [{ font: ['sans', 'sans-semibold', 'sans-bold', 'sans-extrabold'] }],
      rounded: [{ rounded: ['capsule', 'card', 'chip', 'field', 'sheet'] }],
      'type-preset': [{ type: ['display', 'date', 'heading', 'activity', 'body', 'meta', 'label'] }],
    },
    conflictingClassGroups: {
      'type-preset': ['font-size', 'font-family', 'leading', 'tracking'],
    },
  },
});
