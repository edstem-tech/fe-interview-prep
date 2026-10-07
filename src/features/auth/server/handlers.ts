import { http, HttpResponse } from 'msw';
import * as backend from '../mockBackend';
import { ApiError } from '../mockBackend';

function bearer(request: Request): string | null {
  const header = request.headers.get('Authorization');
  return header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
}

// Runs a backend call and maps our ApiError onto a real HTTP status, so these
// endpoints behave (and show up in the Network tab) like a genuine API.
async function respond<T>(fn: () => Promise<T>) {
  try {
    return HttpResponse.json((await fn()) as object);
  } catch (err) {
    if (err instanceof ApiError) {
      return HttpResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}

export const handlers = [
  http.post('/api/login', async ({ request }) => {
    const { username, password } = (await request.json()) as {
      username: string;
      password: string;
    };
    return respond(() => backend.login(username, password));
  }),
  http.post('/api/refresh', async ({ request }) => {
    const { refreshToken } = (await request.json()) as { refreshToken: string };
    return respond(() => backend.refresh(refreshToken));
  }),
  http.get('/api/me', ({ request }) => respond(() => backend.me(bearer(request)))),
  http.get('/api/orders', ({ request }) => respond(() => backend.getOrders(bearer(request)))),
  http.get('/api/admin/stats', ({ request }) => respond(() => backend.getAdminStats(bearer(request)))),
];
