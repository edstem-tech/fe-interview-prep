import { useCallback, useEffect, useState } from 'react';
import { useDebouncedValue } from '../../lib/useDebouncedValue';
import { searchProducts, type Product } from './api';

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

// Module-level cache of successful results, keyed by query. It outlives individual
// mounts, so a repeated query (even after navigating away and back) is served
// instantly with no second request. Only successes are cached, so a failed query
// still retries.
const resultCache = new Map<string, Product[]>();

/** Test helper — reset the shared cache between cases. */
export function clearSearchCache(): void {
  resultCache.clear();
}

export interface ProductSearch {
  query: string;
  setQuery: (query: string) => void;
  /** The trimmed, debounced query that the current results belong to. */
  activeQuery: string;
  status: SearchStatus;
  results: Product[];
  error: string | null;
  retry: () => void;
}

/**
 * Drives the live product search. The raw `query` updates on every keystroke but
 * is debounced before it triggers a request. Each request is tied to an
 * `AbortController`; when the debounced query changes (or the component unmounts)
 * the previous request is aborted and an `active` flag stops any late response
 * from overwriting newer results — so what's on screen always matches the latest
 * query, even if an earlier response arrives out of order.
 */
export function useProductSearch(delayMs = 400): ProductSearch {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), delayMs);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [results, setResults] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    if (debouncedQuery === '') {
      setStatus('idle');
      setResults([]);
      setError(null);
      return;
    }

    // Serve a previously-seen query from cache — no network, no loading flash.
    const cached = resultCache.get(debouncedQuery);
    if (cached) {
      setResults(cached);
      setStatus('success');
      setError(null);
      return;
    }

    const controller = new AbortController();
    let active = true;
    setStatus('loading');
    setError(null);

    searchProducts(debouncedQuery, controller.signal)
      .then((products) => {
        resultCache.set(debouncedQuery, products);
        if (!active) return;
        setResults(products);
        setStatus('success');
      })
      .catch((err: unknown) => {
        // A deliberate abort is not an error the user should see.
        if (!active || controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setStatus('error');
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [debouncedQuery, retryNonce]);

  const retry = useCallback(() => setRetryNonce((n) => n + 1), []);

  return { query, setQuery, activeQuery: debouncedQuery, status, results, error, retry };
}
