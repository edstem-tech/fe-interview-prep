import { useEffect, useState } from 'react';
import {
  expireAccess,
  fireThree,
  loginDemo,
  secondsRemaining,
  type FireResult,
} from './sessionDemo';

export default function SessionTools() {
  const [ready, setReady] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [firing, setFiring] = useState(false);
  const [result, setResult] = useState<FireResult | null>(null);

  useEffect(() => {
    let active = true;
    void loginDemo().then(() => {
      if (active) {
        setReady(true);
        setRemaining(secondsRemaining());
      }
    });
    const id = window.setInterval(() => setRemaining(secondsRemaining()), 1000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  function handleExpire(): void {
    expireAccess();
    setRemaining(0);
    setResult(null);
  }

  async function handleFire(): Promise<void> {
    setFiring(true);
    setResult(null);
    try {
      const outcome = await fireThree();
      setResult(outcome);
      setRemaining(secondsRemaining());
    } finally {
      setFiring(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <h2 className="text-lg font-bold text-slate-900">Session tools</h2>
      <p className="mt-2 text-sm text-slate-600">
        The access token lasts 30 seconds. Expire it now, then fire three requests at once and watch
        the Network tab: three 401 responses, one refresh call, then three successful retries.
      </p>

      <p className="mt-3 text-sm text-slate-700">
        {remaining > 0 ? `Access token expires in ${remaining}s` : 'Access token expired'}
      </p>

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleExpire}
          disabled={!ready}
          className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-50"
        >
          Expire access token now
        </button>
        <button
          type="button"
          onClick={handleFire}
          disabled={!ready || firing}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {firing ? 'Firing…' : 'Fire 3 requests at once'}
        </button>
      </div>

      {result && (
        <p
          className={`mt-3 text-sm font-medium ${
            result.refreshCalls <= 1 ? 'text-green-700' : 'text-red-700'
          }`}
          role="status"
        >
          {result.successes}/3 requests succeeded · {result.refreshCalls} refresh call
          {result.refreshCalls === 1 ? '' : 's'}
          {result.refreshCalls <= 1 ? ' ✓ (check the Network tab)' : ''}
        </p>
      )}
    </section>
  );
}
