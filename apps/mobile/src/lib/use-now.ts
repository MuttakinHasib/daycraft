import { useEffect, useState } from 'react';

const MINUTE_MS = 60_000;

/** The current time, updated on every minute boundary. Drives today, the now line and the active activity. */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        setNow(new Date());
        schedule();
      }, MINUTE_MS - (Date.now() % MINUTE_MS) + 50);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);
  return now;
}
