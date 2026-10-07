import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SortState } from './types';

export const PAGE_SIZES = [10, 25, 50] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export interface TableQueryState {
  q: string;
  gender: string;
  sort: SortState | null;
  page: number;
  pageSize: PageSize;
  setQuery: (q: string) => void;
  setGender: (gender: string) => void;
  setSort: (sort: SortState | null) => void;
  setPage: (page: number) => void;
  setPageSize: (size: PageSize) => void;
}

function isPageSize(value: number): value is PageSize {
  return (PAGE_SIZES as readonly number[]).includes(value);
}

/**
 * Reads and writes the entire table view — global search, column filter, sort,
 * page and page size — from the URL query string. Because it's the single source
 * of truth, a shared link restores the exact view and the browser's back/forward
 * buttons move between views for free. Anything that narrows the data (search,
 * filter, page size) resets to page 1 so the user never lands on an empty page.
 */
export function useTableQueryState(): TableQueryState {
  const [params, setParams] = useSearchParams();

  const state = useMemo(() => {
    const sortKey = params.get('sort');
    const sort: SortState | null = sortKey
      ? { key: sortKey, dir: params.get('dir') === 'desc' ? 'desc' : 'asc' }
      : null;
    const sizeRaw = Number(params.get('size'));
    const pageSize: PageSize = isPageSize(sizeRaw) ? sizeRaw : 10;
    const page = Math.max(1, Number(params.get('page')) || 1);
    return { q: params.get('q') ?? '', gender: params.get('gender') ?? '', sort, page, pageSize };
  }, [params]);

  // Merge changes into the current params; `resetPage` drops the page so narrowing
  // the data returns to page 1.
  const patch = useCallback(
    (changes: Record<string, string | null>, resetPage = false) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (resetPage) next.delete('page');
          for (const [key, value] of Object.entries(changes)) {
            if (value === null || value === '') next.delete(key);
            else next.set(key, value);
          }
          return next;
        },
        { replace: false },
      );
    },
    [setParams],
  );

  const setQuery = useCallback((q: string) => patch({ q }, true), [patch]);
  const setGender = useCallback((gender: string) => patch({ gender }, true), [patch]);
  const setPage = useCallback((page: number) => patch({ page: String(page) }), [patch]);
  const setPageSize = useCallback(
    (size: PageSize) => patch({ size: String(size) }, true),
    [patch],
  );
  const setSort = useCallback(
    (sort: SortState | null) =>
      patch({ sort: sort?.key ?? null, dir: sort ? sort.dir : null }),
    [patch],
  );

  return { ...state, setQuery, setGender, setSort, setPage, setPageSize };
}
