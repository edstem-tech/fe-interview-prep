import * as backend from './mockBackend';
import { ApiError } from './mockBackend';
import { tokenStore } from './tokenStore';

type AuthFailureHandler = () => void;
let onAuthFailure: AuthFailureHandler = () => {};

/** Lets the auth layer react (log out + redirect) when a refresh ultimately fails. */
export function setAuthFailureHandler(handler: AuthFailureHandler): void {
  onAuthFailure = handler;
}

// The in-flight refresh, shared by every caller. While it's non-null, concurrent
// 401s await the same promise instead of each firing their own refresh — so three
// requests that expire together produce exactly one refresh call.
let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = tokenStore.getRefresh();
      if (!refreshToken) throw new ApiError(401, 'No refresh token');
      const { accessToken } = await backend.refresh(refreshToken);
      tokenStore.setAccess(accessToken);
      return accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Runs an authenticated request with the current access token. On a 401 it
 * refreshes once (deduped) and retries the request a single time. If the refresh
 * fails, it clears the session and notifies the auth layer, then rethrows.
 */
export async function authedRequest<T>(request: (token: string | null) => Promise<T>): Promise<T> {
  try {
    return await request(tokenStore.getAccess());
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) throw err;
    try {
      const token = await refreshAccessToken();
      return await request(token);
    } catch (refreshError) {
      tokenStore.clear();
      onAuthFailure();
      throw refreshError;
    }
  }
}

export const api = {
  me: () => authedRequest((token) => backend.me(token)),
  orders: () => authedRequest((token) => backend.getOrders(token)),
  adminStats: () => authedRequest((token) => backend.getAdminStats(token)),
};
