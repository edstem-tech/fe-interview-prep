import type { ReactNode } from 'react';

export type SortDir = 'asc' | 'desc';

export interface SortState {
  key: string;
  dir: SortDir;
}

/**
 * Describes one column of a `DataTable<T>`. The table is data-agnostic: it reads
 * values through `accessor` (used for sorting and global search) and renders cells
 * through optional `render` (falling back to the accessor value).
 */
export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: (row: T) => string | number;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}

/** A row the table can render — just needs a stable id. */
export interface WithId {
  id: string;
}
