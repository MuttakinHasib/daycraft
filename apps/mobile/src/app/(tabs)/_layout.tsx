import { Tabs } from 'expo-router';

import { TabBar, TabRoute } from '@/components/ui';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name={TabRoute.PLAN} />
      <Tabs.Screen name={TabRoute.HABITS} />
      <Tabs.Screen name={TabRoute.GOALS} />
      <Tabs.Screen name={TabRoute.MORE} />
    </Tabs>
  );
}
