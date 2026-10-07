import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Gate for any logged-in user. While the session is still being restored it renders
 * a placeholder (never the login page), so a reload with a valid refresh token does
 * not flash login. Anonymous users are sent to login with the page they wanted, so
 * login can send them back.
 */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <p className="text-slate-500">Restoring your session…</p>;
  }
  if (status === 'anonymous') {
    return (
      <Navigate
        to="/auth/login"
        state={{ from: `${location.pathname}${location.search}` }}
        replace
      />
    );
  }
  return <Outlet />;
}

/** Gate for admins only. Assumes RequireAuth already ran. */
export function RequireAdmin() {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
        <p className="font-semibold">403 — Admins only</p>
        <p className="mt-1 text-sm">
          You're signed in as a standard user.{' '}
          <Link to="/auth" className="underline">
            Back to dashboard
          </Link>
        </p>
      </div>
    );
  }
  return <Outlet />;
}
