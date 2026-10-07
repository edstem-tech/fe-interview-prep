import { describe, it, expect } from 'vitest';
import { globalFilter, nextSort, paginate, sortRows } from './tableUtils';
import type { ColumnDef } from './types';

interface Row {
  id: string;
  name: string;
  age: number;
}

const columns: ColumnDef<Row>[] = [
  { key: 'name', header: 'Name', accessor: (r) => r.name },
  { key: 'age', header: 'Age', accessor: (r) => r.age },
];

const rows: Row[] = [
  { id: '1', name: 'Alice', age: 30 },
  { id: '2', name: 'bob', age: 25 },
  { id: '3', name: 'Carol', age: 40 },
];

describe('tableUtils', () => {
  it('globalFilter matches any column, case-insensitively', () => {
    expect(globalFilter(rows, columns, 'car').map((r) => r.id)).toEqual(['3']);
    expect(globalFilter(rows, columns, '25').map((r) => r.id)).toEqual(['2']);
    expect(globalFilter(rows, columns, '')).toHaveLength(3);
  });

  it('sortRows compares numbers numerically and strings alphabetically', () => {
    expect(sortRows(rows, columns, { key: 'age', dir: 'asc' }).map((r) => r.age)).toEqual([
      25, 30, 40,
    ]);
    expect(sortRows(rows, columns, { key: 'age', dir: 'desc' }).map((r) => r.age)).toEqual([
      40, 30, 25,
    ]);
    // Case-insensitive-ish via localeCompare: lowercase "bob" sorts between the capitals.
    expect(sortRows(rows, columns, { key: 'name', dir: 'asc' }).map((r) => r.name)).toEqual([
      'Alice',
      'bob',
      'Carol',
    ]);
  });

  it('does not mutate the input array', () => {
    const before = rows.map((r) => r.id);
    sortRows(rows, columns, { key: 'age', dir: 'desc' });
    expect(rows.map((r) => r.id)).toEqual(before);
  });

  it('paginate slices and clamps out-of-range pages', () => {
    expect(paginate(rows, 1, 2).rows.map((r) => r.id)).toEqual(['1', '2']);
    const clamped = paginate(rows, 99, 2);
    expect(clamped.page).toBe(2);
    expect(clamped.pageCount).toBe(2);
    expect(clamped.rows.map((r) => r.id)).toEqual(['3']);
  });

  it('nextSort cycles asc -> desc -> none and restarts on a new key', () => {
    expect(nextSort(null, 'age')).toEqual({ key: 'age', dir: 'asc' });
    expect(nextSort({ key: 'age', dir: 'asc' }, 'age')).toEqual({ key: 'age', dir: 'desc' });
    expect(nextSort({ key: 'age', dir: 'desc' }, 'age')).toBeNull();
    expect(nextSort({ key: 'age', dir: 'desc' }, 'name')).toEqual({ key: 'name', dir: 'asc' });
  });
});
