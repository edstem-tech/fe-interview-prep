import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { api } from './apiClient';
import type { Order } from './mockBackend';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .orders()
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Log out
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">Signed in as</p>
        <p className="text-lg font-semibold">{user?.name}</p>
        <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 capitalize">
          {user?.role}
        </span>
      </div>

      <h2 className="mt-6 text-lg font-semibold">Your orders</h2>
      <p className="text-sm text-slate-500">
        Loaded from a protected endpoint. The 30s access token refreshes silently when it expires.
      </p>
      {error ? (
        <p className="mt-2 text-red-600">Couldn't load orders.</p>
      ) : orders === null ? (
        <p className="mt-2 text-slate-500">Loading…</p>
      ) : (
        <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {orders.map((order) => (
            <li key={order.id} className="flex justify-between px-4 py-3">
              <span>{order.item}</span>
              <span className="font-semibold">${order.total}</span>
            </li>
          ))}
        </ul>
      )}

      {user?.role === 'admin' && (
        <Link
          to="/auth/admin"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700"
        >
          Open admin stats →
        </Link>
      )}
    </section>
  );
}
