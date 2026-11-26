import { goalProgress, type Goal, type Milestone } from '@daycraft/domain';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colorValue, Icon, inkClassOn, useToast } from '@/components/ui';
import { goalRepository } from '@/data/goal-store';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme/app-theme';

const RING_SIZE = 56;
const RING_STROKE = 4;
const RING_CENTER = RING_SIZE / 2;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const TABULAR = { fontVariant: ['tabular-nums' as const] };

interface GoalCardProps {
  goal: Goal;
}

/** The Goals card (navigation-and-modules): a 56pt ring in the goal's hue with the percent inside, the title,
 * and the milestone checklist below. Tapping a milestone toggles it and never expands the card. */
export function GoalCard({ goal }: GoalCardProps) {
  const percent = goalProgress(goal.milestones);
  return (
    <View className="rounded-card bg-card p-4">
      <View className="flex-row items-center gap-4">
        <GoalRing hue={goal.hue} percent={percent} />
        <Text numberOfLines={2} className="flex-1 type-activity font-sans-semibold text-ink">
          {goal.title}
        </Text>
      </View>
      {goal.milestones.length > 0 && (
        <View className="mt-3.5 gap-0.5">
          {goal.milestones.map((milestone) => (
            <MilestoneRow key={milestone.id} goal={goal} milestone={milestone} />
          ))}
        </View>
      )}
    </View>
  );
}

interface MilestoneRowProps {
  goal: Goal;
  milestone: Milestone;
}

/** One milestone row (the reference's checklist): a 20pt square filled and outlined in the goal's hue when
 * done, outlined in `line-strong` when open, and its 14pt medium title struck through and dimmed when done. */
function MilestoneRow({ goal, milestone }: MilestoneRowProps) {
  const toast = useToast();
  const colors = useThemeColors();
  const hue = colorValue(goal.hue);
  // The row is 36 tall; the slop reaches the 44pt target, as the chip does for its 36.
  const toggle = () => {
    const done = goalRepository.toggleMilestone(milestone.id);
    if (done) toast(`Milestone reached · ${milestone.title}`);
  };
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: milestone.done }}
      accessibilityLabel={milestone.done ? `Mark not done: ${milestone.title}` : `Complete: ${milestone.title}`}
      hitSlop={{ top: 4, bottom: 4 }}
      onPress={toggle}
      className="min-h-9 flex-row items-center gap-2.5 active:opacity-70"
    >
      <View
        style={{
          borderColor: milestone.done ? hue : colors['line-strong'],
          backgroundColor: milestone.done ? hue : undefined,
        }}
        className="size-5 items-center justify-center rounded-check border-2"
      >
        {milestone.done && <Icon name="check" size={12} strokeWidth={3.2} colorClassName={inkClassOn(goal.hue)} />}
      </View>
      <Text
        className={cn('type-body-sm font-sans-medium', {
          'text-ink': !milestone.done,
          'text-ink-muted line-through': milestone.done,
        })}
      >
        {milestone.title}
      </Text>
    </Pressable>
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
