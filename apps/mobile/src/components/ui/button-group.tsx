import { DrawnButtonGroup } from './drawn-button-group';
import type { ButtonGroupProps } from './button-group-types';

export function ButtonGroup(props: ButtonGroupProps) {
  return <DrawnButtonGroup {...props} />;
}
