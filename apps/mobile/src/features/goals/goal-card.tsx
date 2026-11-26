import { goalProgress, targetLine, type Goal, type ISODate, type Milestone } from '@daycraft/domain';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Chip, ChipSize, colorValue, Icon, inkClassOn, useToast } from '@/components/ui';
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
  today: ISODate;
}

/**
 * The Goals card (navigation-and-modules): a 56pt ring in the goal's hue with the percent inside, then the
 * title, the description and, when the goal has one, the target line with its flag, and the milestone checklist
 * below. Tapping the ring, title or description expands the card to its Edit goal and Delete goal rows; tapping
 * a milestone toggles it and never expands the card.
 */
export function GoalCard({ goal, today }: GoalCardProps) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const percent = goalProgress(goal.milestones);
  const line = targetLine(goal.targetDate, today);
  const toggleOpen = () => setOpen((current) => !current);
  const deleteGoal = () => {
    Alert.alert(`Delete “${goal.title}”?`, 'This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          goalRepository.softDeleteGoal(goal.id);
          toast(`Deleted · ${goal.title}`);
        },
      },
    ]);
  };
  return (
    <View className="rounded-card bg-card p-4">
      <View className="flex-row items-center gap-4">
        {/* A Pressable is the accessible element (React Native makes it one), so the ring's announcement
            lives here, not on the ring: the goal's title with the "N percent complete" the ring shows. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${open ? 'Hide actions' : 'Show actions'}: ${goal.title}, ${percent} percent complete`}
          accessibilityState={{ expanded: open }}
          onPress={toggleOpen}
          className="active:opacity-70"
        >
          <GoalRing hue={goal.hue} percent={percent} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={open ? `Hide actions: ${goal.title}` : `Show actions: ${goal.title}`}
          accessibilityState={{ expanded: open }}
          // A title-only goal makes the header ~22 tall; the slop reaches the 44pt target.
          hitSlop={{ top: 12, bottom: 12 }}
          onPress={toggleOpen}
          className="flex-1 gap-0.5 active:opacity-70"
        >
          <Text numberOfLines={2} className="type-activity font-sans-semibold text-ink">
            {goal.title}
          </Text>
          {goal.description && <Text className="type-body-sm text-ink-muted">{goal.description}</Text>}
          {line && (
            <View className="flex-row items-center gap-1.5">
              <Icon name="flag" size={13} colorClassName="text-ink-muted" />
              <Text style={TABULAR} className="type-meta font-sans-semibold text-ink-muted">
                {line}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
      {goal.milestones.length > 0 && (
        <View className="mt-3.5 gap-0.5">
          {goal.milestones.map((milestone) => (
            <MilestoneRow key={milestone.id} goal={goal} milestone={milestone} />
          ))}
        </View>
      )}
      {open && (
        <View className="mt-3.5 flex-row gap-2 border-t border-line pt-3">
          <Chip
            size={ChipSize.SM}
            onPress={() => router.push({ pathname: '/goal/new', params: { id: goal.id } })}
            accessibilityLabel={`Edit goal: ${goal.title}`}
          >
            Edit goal
          </Chip>
          <Chip size={ChipSize.SM} onPress={deleteGoal} accessibilityLabel={`Delete goal: ${goal.title}`}>
            Delete goal
          </Chip>
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
    <View className="size-14 items-center justify-center">
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
