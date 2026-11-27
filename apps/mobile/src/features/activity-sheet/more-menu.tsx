import { DropdownMenu, DropdownMenuItem, Host, Text } from '@expo/ui/jetpack-compose';
import { useState } from 'react';

import { IconButton, IconButtonSize } from '@/components/ui';
import { useColorScheme, useThemeColors } from '@/theme/app-theme';

import type { MoreMenuProps } from './more-menu-types';

/** The band's ⋯ off iOS: the native button opens a Material 3 dropdown with Start focus, Duplicate and Delete. */
export function MoreMenu({ onStartFocus, onDuplicate, onDelete }: MoreMenuProps) {
  const colors = useThemeColors();
  const scheme = useColorScheme();
  const [open, setOpen] = useState(false);
  const choose = (action: () => void) => () => {
    setOpen(false);
    action();
  };
  return (
    <>
      <IconButton icon="more" size={IconButtonSize.LG} accessibilityLabel="More" onPress={() => setOpen(true)} />
      <Host colorScheme={scheme} matchContents>
        <DropdownMenu expanded={open} onDismissRequest={() => setOpen(false)} color={colors.elevated}>
          <DropdownMenu.Items>
            {onStartFocus && (
              <DropdownMenuItem onClick={choose(onStartFocus)}>
                <DropdownMenuItem.Text>
                  <Text style={{ fontFamily: 'Onest-Regular', fontSize: 16 }}>Start focus</Text>
                </DropdownMenuItem.Text>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={choose(onDuplicate)}>
              <DropdownMenuItem.Text>
                <Text style={{ fontFamily: 'Onest-Regular', fontSize: 16 }}>Duplicate</Text>
              </DropdownMenuItem.Text>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={choose(onDelete)} elementColors={{ textColor: colors.danger }}>
              <DropdownMenuItem.Text>
                <Text style={{ fontFamily: 'Onest-Regular', fontSize: 16 }}>Delete</Text>
              </DropdownMenuItem.Text>
            </DropdownMenuItem>
          </DropdownMenu.Items>
        </DropdownMenu>
      </Host>
    </>
  );
}
