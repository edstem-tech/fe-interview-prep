import { NavLink, Outlet } from 'react-router-dom';
import { features } from '../features/registry';

const linkBase = 'rounded-md px-3 py-1.5 text-sm font-medium transition';
const linkClass = ({ isActive }: { isActive: boolean }): string =>
  isActive
    ? `${linkBase} bg-indigo-600 text-white`
    : `${linkBase} text-slate-600 hover:bg-slate-100`;

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-4xl flex-wrap items-center gap-2 px-4 py-3">
          <NavLink to="/" className={linkClass} end>
            FE Interview Prep
          </NavLink>
          <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
          {features.map((feature) => (
            <NavLink key={feature.id} to={`/${feature.path}`} className={linkClass}>
              {feature.title}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
