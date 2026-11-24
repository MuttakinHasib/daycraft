import { EditScope } from '@daycraft/domain';
import { ActionSheetIOS, Alert, Platform } from 'react-native';

export const ScopeAction = {
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- const + same-named type is intentional
export type ScopeAction = (typeof ScopeAction)[keyof typeof ScopeAction];

interface ScopeQuestion {
  action: ScopeAction;
  /** One line on what changed ("Start time moved"); left out for a delete. */
  summary?: string;
  /** "task" or "event". */
  noun: string;
}

const SCOPES = [EditScope.THIS, EditScope.FUTURE, EditScope.ALL] as const;

/**
 * Asks where a change to a repeating activity goes: this date, this and later dates, or every date. Resolves
 * null when the person cancels, so nothing is written.
 */
export function askScope({ action, summary, noun }: ScopeQuestion): Promise<EditScope | null> {
  const verb = action === ScopeAction.DELETE ? 'Delete' : 'Update';
  const labels = [`${verb} this ${noun} only`, `${verb} all future ${noun}s`, `${verb} all ${noun}s`];
  const title = action === ScopeAction.DELETE ? `Delete which ${noun}s?` : `Apply changes to which ${noun}s?`;
  const destructive = action === ScopeAction.DELETE;
  return new Promise((resolve) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title,
          message: summary,
          options: [...labels, 'Cancel'],
          cancelButtonIndex: labels.length,
          destructiveButtonIndex: destructive ? [0, 1, 2] : undefined,
        },
        (index) => resolve(SCOPES[index] ?? null),
      );
      return;
    }
    // Android dialogs hold three buttons; dismissing the dialog is the cancel.
    Alert.alert(
      title,
      summary,
      labels.map((text, index) => ({
        text,
        style: destructive ? ('destructive' as const) : ('default' as const),
        onPress: () => resolve(SCOPES[index] ?? null),
      })),
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}

/** The ending for a toast after a series change: nothing for one date. */
export function scopeToastSuffix(scope: EditScope): string {
  if (scope === EditScope.FUTURE) return ' · this and later dates';
  if (scope === EditScope.ALL) return ' · every date';
  return '';
}
