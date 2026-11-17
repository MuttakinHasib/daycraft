import { createCn } from 'cn/config';

import { cnConfig } from '@daycraft/design-tokens';

/** `cn` taught Daycraft's token names; the lists come from the token package. */
export const cn = createCn<'type-preset'>(cnConfig);
