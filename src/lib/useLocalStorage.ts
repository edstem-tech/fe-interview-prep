import { useCallback, useEffect, useState } from 'react';

/**
 * State that persists to localStorage under `key`. Mirrors the `useState` API
 * (value + setter, setter accepts a value or an updater). Reads lazily on mount
 * and writes on every change. Falls back to `initialValue` when storage is empty
 * or holds invalid JSON.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => readValue(key, initialValue));

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => (value instanceof Function ? value(prev) : value));
    },
    [],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(stored));
    } catch {
      // Ignore write failures (e.g. storage disabled or over quota).
    }
  }, [key, stored]);

  return [stored, setValue];
}

function readValue<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}
