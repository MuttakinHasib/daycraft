import { Link } from 'expo-router';
import { Text, View } from 'react-native';

// Placeholder Plan screen: the timeline is built here once the screens start.
export default function PlanScreen() {
  return (
    <View className="flex-1 gap-2 bg-canvas px-5 pt-safe">
      <Text className="type-display text-ink">Plan</Text>
      <Text className="type-body text-ink-muted">The timeline for the selected day lands here.</Text>
      <Link href="/design-system" className="py-3 type-body font-sans-semibold text-accent-text">
        Design system →
      </Link>
    </View>
  );
}
