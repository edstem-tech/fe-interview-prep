import type { ColumnDef, SortState, WithId } from './types';

interface DataTableProps<T> {
  rows: T[];
  columns: ColumnDef<T>[];
  sort: SortState | null;
  onSortChange: (key: string) => void;
}

function sortIndicator(sortable: boolean, active: SortState | null, key: string): string {
  if (!sortable) return '';
  if (!active || active.key !== key) return '↕';
  return active.dir === 'asc' ? '↑' : '↓';
}

/**
 * A presentational, data-agnostic table. It knows nothing about users, fetching or
 * URLs — it renders whatever rows and columns it's given, reports header clicks for
 * sortable columns, and shows the active sort direction. Reused for any `T` by
 * passing a different column set.
 */
export default function DataTable<T extends WithId>({
  rows,
  columns,
  sort,
  onSortChange,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            {columns.map((column) => {
              const sortable = column.sortable ?? false;
              const isActive = sort?.key === column.key;
              return (
                <th key={column.key} className="px-4 py-2 font-semibold">
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(column.key)}
                      aria-sort={isActive ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                      className="flex items-center gap-1 hover:text-slate-900"
                    >
                      {column.header}
                      <span className="text-xs text-slate-400">
                        {sortIndicator(sortable, sort, column.key)}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                No rows match the current view.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-2">
                    {column.render ? column.render(row) : column.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
