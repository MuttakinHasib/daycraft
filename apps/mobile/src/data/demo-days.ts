import {
  addDays,
  DEFAULT_DAY_EDGES,
  weekdayOf,
  type ActivityHue,
  type ActivityInput,
  type ActivityKind,
  type IconName,
  type ISODate,
  type Label,
  type Priority,
  type Repeat,
  type SubtaskInput,
} from '@daycraft/domain';

import { activityRepository } from './activity-store';

// Development only: the design prototype's demo days, around today. More imports it inside an `if (__DEV__)`
// block, so production bundles never include it.

interface DemoBase {
  date: ISODate;
  start: number | null;
  durationMinutes: number;
  title: string;
  hue: ActivityHue;
  icon: IconName;
  kind: ActivityKind;
}

interface DemoExtras {
  done?: boolean;
  notes?: string;
  subtasks?: SubtaskInput[];
  repeat?: Repeat;
  priority?: Priority;
  labels?: Label[];
  location?: string;
}

const DAYS_BEFORE = 7;
const DAYS_AFTER = 14;

function demo(base: DemoBase, extras: DemoExtras = {}): ActivityInput {
  return {
    ...base,
    done: extras.done ?? false,
    notes: extras.notes ?? '',
    subtasks: extras.subtasks ?? [],
    repeat: extras.repeat ?? 'never',
    priority: extras.priority ?? 'none',
    labels: extras.labels ?? [],
    location: extras.location ?? '',
    projectId: null,
  };
}

function steps(titles: string[], done: boolean): SubtaskInput[] {
  return titles.map((title) => ({ title, done }));
}

function everyDay(date: ISODate, offset: number): ActivityInput[] {
  const weekday = weekdayOf(date);
  const past = offset < 0;
  const list: ActivityInput[] = [
    demo(
      { date, start: 360, durationMinutes: 0, title: 'Rise and shine', hue: 'clay', icon: 'alarm', kind: 'routine' },
      { repeat: 'daily' },
    ),
    demo(
      { date, start: 370, durationMinutes: 35, title: 'Morning routine', hue: 'amber', icon: 'sun', kind: 'routine' },
      {
        repeat: 'daily',
        subtasks: steps(
          ['Make the bed', 'Stretch for 5 minutes', 'Cold shower', 'Coffee and plan the day'],
          offset <= 0,
        ),
      },
    ),
  ];
  if (offset !== 0) {
    if (weekday >= 1 && weekday <= 5) {
      list.push(
        demo(
          { date, start: 570, durationMinutes: 120, title: 'Deep work', hue: 'clay', icon: 'laptop', kind: 'task' },
          { labels: ['Work'] },
        ),
      );
    }
    if (weekday === 1 || weekday === 3 || weekday === 5) {
      list.push(
        demo({
          date,
          start: 1050,
          durationMinutes: 60,
          title: 'Gym · Full body',
          hue: 'sage',
          icon: 'dumbbell',
          kind: 'routine',
        }),
      );
    }
    if (weekday === 2 || weekday === 4) {
      list.push(
        demo(
          { date, start: 1110, durationMinutes: 40, title: 'Evening run', hue: 'sage', icon: 'run', kind: 'task' },
          { labels: ['Health'] },
        ),
      );
    }
    if (weekday === 6) {
      list.push(
        demo(
          {
            date,
            start: 660,
            durationMinutes: 90,
            title: 'Family brunch',
            hue: 'rose',
            icon: 'utensils',
            kind: 'event',
          },
          { location: 'Home' },
        ),
      );
    }
    if (weekday === 0) {
      list.push(
        demo(
          { date, start: 600, durationMinutes: 60, title: 'Weekly review', hue: 'iris', icon: 'doc', kind: 'task' },
          { repeat: 'weekly' },
        ),
      );
    }
  }
  list.push(
    demo(
      { date, start: 1350, durationMinutes: 0, title: 'Wind down', hue: 'slate', icon: 'moon', kind: 'routine' },
      { repeat: 'daily' },
    ),
  );
  return past ? list.map((activity) => ({ ...activity, done: true })) : list;
}

function today(date: ISODate): ActivityInput[] {
  return [
    demo(
      { date, start: 415, durationMinutes: 35, title: 'Run · 5K', hue: 'sage', icon: 'run', kind: 'task' },
      { done: true, labels: ['Health'] },
    ),
    demo(
      { date, start: 460, durationMinutes: 25, title: 'Breakfast', hue: 'amber', icon: 'coffee', kind: 'task' },
      { done: true },
    ),
    demo(
      { date, start: 495, durationMinutes: 30, title: 'Read 20 pages', hue: 'iris', icon: 'book', kind: 'task' },
      { done: true, notes: 'The Creative Act, chapter 4.' },
    ),
    demo(
      {
        date,
        start: 570,
        durationMinutes: 120,
        title: 'Deep work · Onboarding flow',
        hue: 'clay',
        icon: 'laptop',
        kind: 'task',
      },
      {
        priority: 'high',
        labels: ['Work'],
        notes: 'Focus on the first-run experience. Notifications off until 11:30.',
        subtasks: [
          { title: 'Audit current screens', done: true },
          { title: 'Sketch the new welcome step', done: true },
          { title: 'Prototype the time picker', done: false },
          { title: 'Share with the team', done: false },
        ],
      },
    ),
    demo(
      { date, start: 720, durationMinutes: 30, title: 'Design sync', hue: 'sky', icon: 'video', kind: 'event' },
      { location: 'Google Meet', labels: ['Work'] },
    ),
    demo(
      { date, start: 765, durationMinutes: 45, title: 'Lunch with Maya', hue: 'rose', icon: 'utensils', kind: 'event' },
      { location: 'Fika Café' },
    ),
    demo(
      {
        date,
        start: 870,
        durationMinutes: 90,
        title: 'Write Q4 roadmap draft',
        hue: 'pine',
        icon: 'doc',
        kind: 'task',
      },
      {
        priority: 'medium',
        labels: ['Work'],
        subtasks: steps(['Collect team input', 'Outline three themes', 'Draft milestones'], false),
      },
    ),
    demo(
      { date, start: 975, durationMinutes: 15, title: 'Call the dentist', hue: 'sun', icon: 'phone', kind: 'task' },
      { priority: 'low', labels: ['Errand'] },
    ),
    demo(
      {
        date,
        start: 1050,
        durationMinutes: 60,
        title: 'Gym · Upper body',
        hue: 'sage',
        icon: 'dumbbell',
        kind: 'routine',
      },
      { subtasks: steps(['Warm-up · 10 min', 'Bench press', 'Rows', 'Stretch'], false) },
    ),
    demo({ date, start: 1170, durationMinutes: 45, title: 'Dinner', hue: 'amber', icon: 'utensils', kind: 'task' }),
    demo(
      { date, start: 1290, durationMinutes: 15, title: 'Journal and reflect', hue: 'iris', icon: 'pen', kind: 'task' },
      { repeat: 'daily' },
    ),
  ];
}

function nearby(date: ISODate): ActivityInput[] {
  const on = (offset: number) => addDays(date, offset);
  return [
    demo(
      {
        date: on(1),
        start: 840,
        durationMinutes: 45,
        title: 'Dentist appointment',
        hue: 'rose',
        icon: 'heart',
        kind: 'event',
      },
      { location: 'Smile Dental, Banani' },
    ),
    demo(
      {
        date: on(2),
        start: 900,
        durationMinutes: 60,
        title: 'Product review',
        hue: 'sky',
        icon: 'video',
        kind: 'event',
      },
      { location: 'Room 4B', labels: ['Work'] },
    ),
    demo(
      {
        date: on(3),
        start: 1170,
        durationMinutes: 90,
        title: 'Dinner with parents',
        hue: 'rose',
        icon: 'utensils',
        kind: 'event',
      },
      { location: 'Mom and Dad' },
    ),
    demo(
      {
        date: on(6),
        start: 720,
        durationMinutes: 90,
        title: 'Quarterly planning',
        hue: 'sky',
        icon: 'briefcase',
        kind: 'event',
      },
      { location: 'Main office', labels: ['Work'] },
    ),
    demo(
      {
        date: on(8),
        start: 1140,
        durationMinutes: 120,
        title: 'Concert night',
        hue: 'iris',
        icon: 'music',
        kind: 'event',
      },
      { location: 'City Hall' },
    ),
    demo(
      { date: on(-1), start: 780, durationMinutes: 45, title: 'Lunch walk', hue: 'sage', icon: 'leaf', kind: 'task' },
      { done: true },
    ),
  ];
}

/** Replaces the activities from a week before `date` to two weeks after with the prototype's demo days. */
export function loadDemoDays(date: ISODate): void {
  for (let offset = -DAYS_BEFORE; offset <= DAYS_AFTER; offset++) {
    for (const existing of activityRepository.readDay(addDays(date, offset))) activityRepository.remove(existing.id);
  }
  const inputs: ActivityInput[] = [];
  for (let offset = -DAYS_BEFORE; offset <= DAYS_AFTER; offset++)
    inputs.push(...everyDay(addDays(date, offset), offset));
  inputs.push(...today(date), ...nearby(date));
  for (const input of inputs) activityRepository.create(input);
  activityRepository.setDayEdges(DEFAULT_DAY_EDGES);
}
