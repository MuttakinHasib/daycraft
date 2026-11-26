import { EntryPoint } from '@daycraft/domain';
import { router, Tabs } from 'expo-router';

import { CreateAction, TabBar, TabRoute } from '@/components/ui';

function create(action: CreateAction) {
  if (action === CreateAction.NEW_TASK) {
    router.push({ pathname: '/activity/new', params: { entry: EntryPoint.PLUS } });
    return;
  }
  if (action === CreateAction.NEW_GOAL) {
    router.push('/goal/new');
    return;
  }
  router.push('/habit/new');
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} onCreate={create} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name={TabRoute.PLAN} />
      <Tabs.Screen name={TabRoute.HABITS} />
      <Tabs.Screen name={TabRoute.GOALS} />
      <Tabs.Screen name={TabRoute.MORE} />
    </Tabs>
  );
}
