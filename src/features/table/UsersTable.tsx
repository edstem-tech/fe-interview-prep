import { useEffect, useMemo, useState } from 'react';
import DataTable from './DataTable';
import { fetchUsers, type UserRow } from './api';
import { globalFilter, nextSort, paginate, sortRows } from './tableUtils';
import { PAGE_SIZES, useTableQueryState } from './useTableQueryState';
import type { ColumnDef } from './types';

const columns: ColumnDef<UserRow>[] = [
  {
    key: 'name',
    header: 'Name',
    accessor: (u) => `${u.firstName} ${u.lastName}`,
    render: (u) => (
      <span className="font-medium">
        {u.firstName} {u.lastName}
      </span>
    ),
    sortable: true,
  },
  { key: 'email', header: 'Email', accessor: (u) => u.email, sortable: true },
  {
    key: 'gender',
    header: 'Gender',
    accessor: (u) => u.gender,
    render: (u) => <span className="capitalize">{u.gender}</span>,
  },
  { key: 'city', header: 'City', accessor: (u) => u.city, sortable: true },
  { key: 'country', header: 'Country', accessor: (u) => u.country, sortable: true },
  { key: 'age', header: 'Age', accessor: (u) => u.age, sortable: true },
];

export default function UsersTable() {
  const [allRows, setAllRows] = useState<UserRow[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const view = useTableQueryState();

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    fetchUsers(controller.signal)
      .then((rows) => {
        setAllRows(rows);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setStatus('error');
          console.error(err);
        }
      });
    return () => controller.abort();
  }, []);

  // search → column filter → sort → paginate, each a pure step.
  const processed = useMemo(() => {
    let rows = globalFilter(allRows, columns, view.q);
    if (view.gender) rows = rows.filter((row) => row.gender === view.gender);
    if (view.sort) rows = sortRows(rows, columns, view.sort);
    return rows;
  }, [allRows, view.q, view.gender, view.sort]);

  const pageResult = paginate(processed, view.page, view.pageSize);

  if (status === 'loading') {
    return <p className="text-slate-500">Loading users…</p>;
  }
  if (status === 'error') {
    return <p className="text-red-600">Could not load users. Please refresh.</p>;
  }

  return (
    <section>
      <h1 className="text-2xl font-bold">Data Table</h1>
      <p className="mt-1 text-sm text-slate-600">
        {allRows.length} users. Sort, search and filter — the whole view lives in the URL, so a link
        restores it and back/forward just works.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium text-slate-700">Search</span>
          <input
            type="search"
            aria-label="Search users"
            value={view.q}
            onChange={(e) => view.setQuery(e.target.value)}
            placeholder="Name, email, city…"
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </label>

        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium text-slate-700">Gender</span>
          <select
            aria-label="Filter by gender"
            value={view.gender}
            onChange={(e) => view.setGender(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">All</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </label>

        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium text-slate-700">Rows</span>
          <select
            aria-label="Rows per page"
            value={view.pageSize}
            onChange={(e) => view.setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number])}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        <DataTable
          rows={pageResult.rows}
          columns={columns}
          sort={view.sort}
          onSortChange={(key) => view.setSort(nextSort(view.sort, key))}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
        <span>
          {processed.length} match{processed.length === 1 ? '' : 'es'} · page {pageResult.page} of{' '}
          {pageResult.pageCount}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => view.setPage(pageResult.page - 1)}
            disabled={pageResult.page <= 1}
            className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => view.setPage(pageResult.page + 1)}
            disabled={pageResult.page >= pageResult.pageCount}
            className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
