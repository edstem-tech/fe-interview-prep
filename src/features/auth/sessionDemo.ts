import { ACCESS_TTL_MS } from './mockBackend';

// A tiny, self-contained client for the "Session tools" demo. It holds its OWN
// tokens (separate from the app's AuthContext) and talks to the MSW-backed /api/*
// endpoints with real fetch, so the single-flight refresh is visible in the Network
// tab. The single-flight logic mirrors the production apiClient.

interface DemoState {
  access: string | null;
  refresh: string | null;
  issuedAt: number;
}

const state: DemoState = { access: null, refresh: null, issuedAt: 0 };
let refreshPromise: Promise<string> | null = null;
let refreshCount = 0;

class Unauthorized extends Error {}

/** Logs the demo in (as admin) so all three protected endpoints are reachable. */
export async function loginDemo(): Promise<void> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password' }),
  });
  if (!res.ok) throw new Error('Demo login failed');
  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  state.access = data.accessToken;
  state.refresh = data.refreshToken;
  state.issuedAt = Date.now();
}

/** Forces the next requests to 401 by dropping the access token (simulated expiry). */
export function expireAccess(): void {
  state.access = null;
}

/** Seconds until the access token expires (0 once expired/dropped). */
export function secondsRemaining(): number {
  if (!state.access) return 0;
  return Math.max(0, Math.ceil((state.issuedAt + ACCESS_TTL_MS - Date.now()) / 1000));
}

function refresh(): Promise<string> {
  if (!refreshPromise) {
    refreshCount += 1;
    refreshPromise = fetch('/api/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: state.refresh }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Refresh failed');
        return res.json() as Promise<{ accessToken: string }>;
      })
      .then(({ accessToken }) => {
        state.access = accessToken;
        state.issuedAt = Date.now();
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function call(path: string, token: string | null): Promise<unknown> {
  const res = await fetch(path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 401) throw new Unauthorized();
  if (!res.ok) throw new Error(`Request to ${path} failed (${res.status})`);
  return res.json();
}

async function authed(path: string): Promise<unknown> {
  try {
    return await call(path, state.access);
  } catch (err) {
    if (!(err instanceof Unauthorized)) throw err;
    const token = await refresh();
    return call(path, token);
  }
}

export interface FireResult {
  successes: number;
  refreshCalls: number;
}

/** Fires the three protected endpoints at once and reports how many refreshes ran. */
export async function fireThree(): Promise<FireResult> {
  const before = refreshCount;
  const results = await Promise.allSettled([
    authed('/api/me'),
    authed('/api/orders'),
    authed('/api/admin/stats'),
  ]);
  return {
    successes: results.filter((r) => r.status === 'fulfilled').length,
    refreshCalls: refreshCount - before,
  };
}
