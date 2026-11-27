export interface MoreMenuProps {
  /** Opens Focus on this task. Left out for events: the docs give Start focus to tasks only. */
  onStartFocus?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}
