import type { ColumnDef, SortState } from './types';

/** Case-insensitive substring match of `query` against any column's accessor value. */
export function globalFilter<T>(rows: T[], columns: ColumnDef<T>[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) =>
    columns.some((column) => String(column.accessor(row)).toLowerCase().includes(q)),
  );
}

/**
 * Sorts by the given column's accessor. Numbers compare numerically, everything
 * else compares as a locale string. Returns a new array; the empty/absent sort is
 * handled by the caller (it just doesn't call this).
 */
export function sortRows<T>(rows: T[], columns: ColumnDef<T>[], sort: SortState): T[] {
  const column = columns.find((c) => c.key === sort.key);
  if (!column) return rows;
  const factor = sort.dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = column.accessor(a);
    const bv = column.accessor(b);
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
    return String(av).localeCompare(String(bv)) * factor;
  });
}

export interface Page<T> {
  rows: T[];
  pageCount: number;
  page: number;
}

/**
 * Slices `rows` for a 1-based page. Clamps the page into range so an out-of-range
 * page (e.g. after a filter shrinks the data) still returns a valid slice.
 */
export function paginate<T>(rows: T[], page: number, pageSize: number): Page<T> {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), pageCount, page: safePage };
}

/** Advances a column through the asc → desc → none sort cycle. */
export function nextSort(current: SortState | null, key: string): SortState | null {
  if (!current || current.key !== key) return { key, dir: 'asc' };
  if (current.dir === 'asc') return { key, dir: 'desc' };
  return null;
}
