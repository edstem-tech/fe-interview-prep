import { useEffect, useState } from 'react';

/**
 * Returns a copy of `value` that only updates after it has stayed unchanged for
 * `delayMs`. Used to avoid firing a search on every keystroke: the debounced
 * query settles once the user briefly stops typing.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
