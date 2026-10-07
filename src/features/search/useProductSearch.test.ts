import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useProductSearch } from './useProductSearch';
import type { Product } from './api';
import { searchProducts } from './api';

vi.mock('./api', () => ({ searchProducts: vi.fn() }));
const mockedSearch = vi.mocked(searchProducts);

function product(id: number, title: string): Product {
  return { id, title, brand: 'Acme', category: 'misc', price: 9, thumbnail: '' };
}

/** A promise plus the resolve handle, so a test can resolve it whenever it likes. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('useProductSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockedSearch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces: typing quickly sends exactly one request', async () => {
    mockedSearch.mockResolvedValue([product(1, 'React book')]);
    const { result } = renderHook(() => useProductSearch(400));

    // Simulate five quick keystrokes, each well within the debounce window.
    for (const text of ['r', 're', 'rea', 'reac', 'react']) {
      act(() => result.current.setQuery(text));
      act(() => {
        vi.advanceTimersByTime(50);
      });
    }

    // Nothing fired yet — the query is still settling.
    expect(mockedSearch).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(mockedSearch).toHaveBeenCalledTimes(1);
    expect(mockedSearch).toHaveBeenCalledWith('react', expect.any(AbortSignal));
  });

  it('ignores an out-of-order (stale) response', async () => {
    const first = deferred<Product[]>();
    const second = deferred<Product[]>();
    mockedSearch.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    const { result } = renderHook(() => useProductSearch(400));

    act(() => result.current.setQuery('a'));
    act(() => {
      vi.advanceTimersByTime(400);
    });
    act(() => result.current.setQuery('ab'));
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(mockedSearch).toHaveBeenCalledTimes(2);

    // The newer request resolves first…
    await act(async () => {
      second.resolve([product(2, 'ab result')]);
    });
    // …then the stale one resolves late and must be ignored.
    await act(async () => {
      first.resolve([product(1, 'a result')]);
    });

    expect(result.current.status).toBe('success');
    expect(result.current.results).toEqual([product(2, 'ab result')]);
    expect(result.current.activeQuery).toBe('ab');
  });
});
