import { goalProgress, targetLine, type Goal, type ISODate } from '@daycraft/domain';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colorValue, Icon } from '@/components/ui';
import { useThemeColors } from '@/theme/app-theme';

const RING_SIZE = 56;
const RING_STROKE = 4;
const RING_CENTER = RING_SIZE / 2;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const TABULAR = { fontVariant: ['tabular-nums' as const] };

interface GoalCardProps {
  goal: Goal;
  today: ISODate;
}

/**
 * The Goals card (navigation-and-modules): a 56pt ring in the goal's hue with the percent inside, then the
 * title and, when the goal has one, the target line with its flag.
 */
export function GoalCard({ goal, today }: GoalCardProps) {
  // Milestones arrive in a later slice, so every goal has none and reads 0% for now.
  const percent = goalProgress([]);
  const line = targetLine(goal.targetDate, today);
  return (
    <View className="flex-row items-center gap-4 rounded-card bg-card p-4">
      <GoalRing hue={goal.hue} percent={percent} />
      <View className="flex-1 gap-0.5">
        <Text numberOfLines={2} className="type-activity font-sans-semibold text-ink">
          {goal.title}
        </Text>
        {line && (
          <View className="flex-row items-center gap-1.5">
            <Icon name="flag" size={13} colorClassName="text-ink-muted" />
            <Text style={TABULAR} className="type-meta font-sans-semibold text-ink-muted">
              {line}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

interface GoalRingProps {
  hue: Goal['hue'];
  percent: number;
}

function GoalRing({ hue, percent }: GoalRingProps) {
  const colors = useThemeColors();
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${percent} percent complete`}
      className="size-14 items-center justify-center"
    >
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        style={{ position: 'absolute' }}
      >
        <Circle
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke={colors['line-strong']}
          strokeWidth={RING_STROKE}
        />
        {percent > 0 && (
          <Circle
            cx={RING_CENTER}
            cy={RING_CENTER}
            r={RING_RADIUS}
            fill="none"
            stroke={colorValue(hue)}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={`${(Math.min(percent, 100) / 100) * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
            transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}
          />
        )}
      </Svg>
      <Text style={TABULAR} className="type-control font-sans-semibold text-ink">
        {`${percent}%`}
      </Text>
    </View>
  );
}
