import { useEffect, useEffectEvent, useState } from 'react';

type Listener = () => void;

/** What the live hooks re-read on: a repository that notifies its listeners after every write. */
export interface LiveRepository {
  subscribe: (listener: Listener) => () => void;
}

interface LiveInput<T> {
  read: () => T;
  /** Names what `read` depends on; a changed key re-reads at once. */
  key: string;
  repository: LiveRepository;
}

/** Reads now, and again after every write through the repository. */
export function useLive<T>({ read, key, repository }: LiveInput<T>): T {
  const [live, setLive] = useState<{ key: string; value: T }>(() => ({ key, value: read() }));
  const refresh = useEffectEvent(() => setLive({ key, value: read() }));
  useEffect(() => repository.subscribe(refresh), [repository]);
  if (live.key !== key) {
    const next = { key, value: read() };
    setLive(next);
    return next.value;
  }
  return live.value;
}
