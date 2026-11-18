import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui';
import { TabScreen } from '@/features/navigation/tab-screen';

// Placeholder until the More modules land: only the design-system reference is reachable.
export function MoreScreen() {
  return (
    <TabScreen title="More" description="Inbox, routines, projects and journal will appear here.">
      <View className="overflow-hidden rounded-card bg-card">
        <Link href="/more/design-system" asChild>
          <Pressable accessibilityRole="link" className="min-h-13 flex-row items-center gap-3 px-4 active:bg-sunken">
            <Icon name="grid" size={18} colorClassName="text-ink-subtle" />
            <Text className="type-body flex-1 text-ink">Design system</Text>
            <Icon name="chev-r" size={18} colorClassName="text-ink-subtle" />
          </Pressable>
        </Link>
      </View>
    </TabScreen>
  );
}
