import { useProductSearch } from './useProductSearch';
import Highlight from './Highlight';

export default function LiveSearch() {
  const search = useProductSearch();

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold">Live Search</h1>
      <p className="mt-1 text-sm text-slate-600">
        Searches the DummyJSON product catalogue as you type. Requests are debounced and
        out-of-order responses are ignored.
      </p>

      <div className="mt-6">
        <input
          type="search"
          aria-label="Search products"
          value={search.query}
          onChange={(event) => search.setQuery(event.target.value)}
          placeholder="Try “phone”, “laptop”, “shirt”…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div className="mt-4" aria-live="polite">
        {search.status === 'loading' && <p className="text-slate-500">Searching…</p>}

        {search.status === 'error' && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <span>{search.error ?? 'Something went wrong.'}</span>
            <button
              type="button"
              onClick={search.retry}
              className="rounded-md bg-red-600 px-3 py-1 font-medium text-white transition hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {search.status === 'success' && search.results.length === 0 && (
          <p className="text-slate-500">
            No results for “{search.activeQuery}”.
          </p>
        )}

        {search.status === 'success' && search.results.length > 0 && (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {search.results.map((product) => (
              <li key={product.id} className="flex items-center gap-3 px-4 py-3">
                <img
                  src={product.thumbnail}
                  alt=""
                  className="size-10 rounded object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    <Highlight text={product.title} query={search.activeQuery} />
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {product.brand ? `${product.brand} · ` : ''}
                    {product.category}
                  </p>
                </div>
                <span className="font-semibold text-slate-700">${product.price}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
