import { useSyncExternalStore } from 'react';

import type { ISODate } from '@daycraft/domain';

// Plan state that other screens read: the + and the editor need Plan's selected date, and Plan needs to know
// which activity was just created so it can pop in.

type Listener = () => void;

interface PlanState {
  /** Null until Plan picks a date; then the date Plan shows. */
  selectedDate: ISODate | null;
  /** The activity created last, until its pop has played. */
  justCreatedId: string | null;
}

const POP_MS = 900;

let state: PlanState = { selectedDate: null, justCreatedId: null };
const listeners = new Set<Listener>();

function update(next: Partial<PlanState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The date Plan shows: `today` until another date is picked. */
export function useSelectedDate(today: ISODate): ISODate {
  return useSyncExternalStore(subscribe, () => state.selectedDate) ?? today;
}

export function selectedDateOr(today: ISODate): ISODate {
  return state.selectedDate ?? today;
}

export function selectDate(date: ISODate) {
  update({ selectedDate: date });
}

export function useJustCreatedId(): string | null {
  return useSyncExternalStore(subscribe, () => state.justCreatedId);
}

/** Marks an activity as just created, so its capsule pops in for a moment. */
export function markJustCreated(id: string) {
  update({ justCreatedId: id });
  setTimeout(() => {
    if (state.justCreatedId === id) update({ justCreatedId: null });
  }, POP_MS);
}
