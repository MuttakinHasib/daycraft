import type { Button } from '@expo/ui/swift-ui';
import type { ComponentProps } from 'react';

import type { IconButtonProps } from './icon-button-types';

export type SFSymbol = NonNullable<ComponentProps<typeof Button>['systemImage']>;

// The SF Symbol for each icon the native button draws; any other icon keeps the drawn button.
/** iOS only. */
export const SF_SYMBOLS: Partial<Record<IconButtonProps['icon'], SFSymbol>> = {
  x: 'xmark',
  'chev-l': 'chevron.left',
  'chev-r': 'chevron.right',
  'chev-d': 'chevron.down',
  more: 'ellipsis',
  plus: 'plus',
  minus: 'minus',
};
