import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './apiClient';
import type { AdminStats } from './mockBackend';

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .adminStats()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const cards: { label: string; value: string }[] = stats
    ? [
        { label: 'Users', value: stats.users.toLocaleString() },
        { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}` },
        { label: 'Open tickets', value: String(stats.openTickets) },
      ]
    : [];

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin stats</h1>
        <Link to="/auth" className="text-sm text-indigo-600 hover:underline">
          ← Dashboard
        </Link>
      </div>
      <p className="mt-1 text-sm text-slate-600">Visible only to admins.</p>

      {error ? (
        <p className="mt-4 text-red-600">Couldn't load stats.</p>
      ) : stats === null ? (
        <p className="mt-4 text-slate-500">Loading…</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-1 text-2xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
