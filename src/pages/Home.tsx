import { Link } from 'react-router-dom';
import { features } from '../features/registry';

export default function Home() {
  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">Front-end Interview Prep</h1>
      <p className="mt-2 text-slate-600">
        Five React + TypeScript features, each on its own route and shipped as its own pull request.
      </p>

      {features.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-slate-300 p-6 text-slate-500">
          No features yet. Each question branch adds one.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <li key={feature.id}>
              <Link
                to={`/${feature.path}`}
                className="block h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-400 hover:shadow"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  {feature.id}
                </span>
                <h2 className="mt-1 text-lg font-semibold">{feature.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{feature.tagline}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
