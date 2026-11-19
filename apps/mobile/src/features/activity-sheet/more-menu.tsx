import { Alert } from 'react-native';

import { BandButton } from './sheet-chrome';
import type { MoreMenuProps } from './more-menu-types';

/** The band's ⋯ off iOS: the same two actions in a system dialog. */
export function MoreMenu({ onDuplicate, onDelete }: MoreMenuProps) {
  const open = () =>
    Alert.alert('', undefined, [
      { text: 'Duplicate', onPress: onDuplicate },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
      { text: 'Cancel', style: 'cancel' },
    ]);
  return <BandButton icon="more" accessibilityLabel="More" onPress={open} />;
}
