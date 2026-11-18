import { createCn } from 'cn/config';

import { cnConfig } from '@daycraft/design-tokens';

/** `cn` configured with Daycraft's token names, which come from the token package. */
export const cn = createCn<'type-preset'>(cnConfig);
