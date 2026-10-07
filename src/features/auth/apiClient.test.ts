import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, setAuthFailureHandler } from './apiClient';
import * as backend from './mockBackend';
import { tokenStore } from './tokenStore';

describe('apiClient — silent, single-flight refresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T00:00:00Z'));
    tokenStore.clear();
    window.localStorage.clear();
    setAuthFailureHandler(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('fires exactly one refresh when three requests expire at once', async () => {
    const session = await backend.login('admin', 'password');
    tokenStore.setAccess(session.accessToken);
    tokenStore.setRefresh(session.refreshToken);

    const refreshSpy = vi.spyOn(backend, 'refresh');

    // Past the 30s access lifetime, still within the 10min refresh lifetime.
    vi.setSystemTime(Date.now() + 31_000);

    const [profile, orders, stats] = await Promise.all([
      api.me(),
      api.orders(),
      api.adminStats(),
    ]);

    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(profile.username).toBe('admin');
    expect(orders).toHaveLength(3);
    expect(stats.users).toBeGreaterThan(0);
  });

  it('logs out and clears tokens when the refresh token has also expired', async () => {
    const session = await backend.login('user', 'password');
    tokenStore.setAccess(session.accessToken);
    tokenStore.setRefresh(session.refreshToken);

    const onFailure = vi.fn();
    setAuthFailureHandler(onFailure);

    // Past the 10min refresh lifetime — refresh itself now fails.
    vi.setSystemTime(Date.now() + 11 * 60_000);

    await expect(api.me()).rejects.toThrow();
    expect(onFailure).toHaveBeenCalledTimes(1);
    expect(tokenStore.getRefresh()).toBeNull();
    expect(tokenStore.getAccess()).toBeNull();
  });

  it('enforces the admin-only endpoint for standard users', async () => {
    const session = await backend.login('user', 'password');
    tokenStore.setAccess(session.accessToken);
    tokenStore.setRefresh(session.refreshToken);

    await expect(api.adminStats()).rejects.toMatchObject({ status: 403 });
  });
});
