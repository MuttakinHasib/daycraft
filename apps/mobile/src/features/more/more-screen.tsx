import { Link } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';

import { todayISO } from '@daycraft/domain';

import { Icon } from '@/components/ui';
import { TabScreen } from '@/features/navigation/tab-screen';

// Development only. The import sits inside an `if (__DEV__)` block, which Metro removes from production bundles,
// so the demo data never ships.
async function loadDemoDays() {
  if (__DEV__) {
    const demo = await import('@/data/demo-days');
    demo.loadDemoDays(todayISO(new Date()));
    Alert.alert('Demo days loaded', "The design prototype's activities now fill the week before today through two weeks after.");
  }
}

// Placeholder until the More modules are built. For now it links to the design-system screen.
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
        {__DEV__ && (
          <Pressable
            accessibilityRole="button"
            onPress={loadDemoDays}
            className="min-h-13 flex-row items-center gap-3 border-t border-line px-4 active:bg-sunken"
          >
            <Icon name="spark" size={18} colorClassName="text-ink-subtle" />
            <Text className="type-body flex-1 text-ink">Load demo days</Text>
          </Pressable>
        )}
      </View>
    </TabScreen>
  );
}
