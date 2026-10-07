// Where the tokens live, and why:
//
// - **Access token → in memory only.** It's short-lived (30s) and sent with every
//   request. Keeping it in a module variable (never localStorage) means an XSS
//   payload can't read a long-lived credential off disk, and it dies with the tab.
// - **Refresh token → localStorage.** It must outlive a page reload to restore the
//   session, so it has to be persisted somewhere JS can read on startup. In a real
//   app the stronger choice is an httpOnly, SameSite cookie the JS can't touch —
//   but that needs a real server to set it; with a mock backend, localStorage is
//   the honest stand-in. This is the main trade-off I'd flag in review.

const REFRESH_KEY = 'q5.refreshToken';

let accessToken: string | null = null;

export const tokenStore = {
  getAccess(): string | null {
    return accessToken;
  },
  setAccess(token: string | null): void {
    accessToken = token;
  },
  getRefresh(): string | null {
    try {
      return window.localStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },
  setRefresh(token: string | null): void {
    try {
      if (token) window.localStorage.setItem(REFRESH_KEY, token);
      else window.localStorage.removeItem(REFRESH_KEY);
    } catch {
      // Ignore storage failures.
    }
  },
  clear(): void {
    accessToken = null;
    this.setRefresh(null);
  },
};
