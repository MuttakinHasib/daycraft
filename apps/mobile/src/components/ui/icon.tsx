import { Icon as DaycraftIcon } from '@daycraft/icons/native';
import { withUniwind } from 'uniwind';

/**
 * A Daycraft icon colored by a class, like text: `<Icon name="run" colorClassName="text-ink" />`.
 * Uniwind turns the class into the icon's `color` prop.
 */
export const Icon = withUniwind(DaycraftIcon, {
  color: { fromClassName: 'colorClassName', styleProperty: 'color' },
});
