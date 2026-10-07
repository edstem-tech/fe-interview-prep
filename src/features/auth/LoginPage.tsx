import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import SessionTools from './SessionTools';

interface FromState {
  from?: string;
}

export default function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as FromState | null)?.from ?? '/auth';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Already signed in (e.g. navigated to /auth/login directly) → bounce onward.
  if (status === 'authenticated') {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch {
      setError('Invalid username or password.');
    } finally {
      setBusy(false);
    }
  }

  function fillDemo(demoUser: string): void {
    setUsername(demoUser);
    setPassword('password');
  }

  return (
    <section className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="mt-1 text-sm text-slate-600">
        Protected pages redirect here, then back once you're in.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-700">
            Username
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
        <p className="font-medium">Demo accounts (password: “password”)</p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => fillDemo('user')}
            className="rounded border border-slate-300 bg-white px-2 py-1 hover:bg-slate-50"
          >
            Use “user”
          </button>
          <button
            type="button"
            onClick={() => fillDemo('admin')}
            className="rounded border border-slate-300 bg-white px-2 py-1 hover:bg-slate-50"
          >
            Use “admin”
          </button>
        </div>
      </div>

      <SessionTools />
    </section>
  );
}
