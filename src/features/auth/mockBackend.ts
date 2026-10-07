// A fully client-side mock of an auth backend. Tokens are base64-encoded JSON
// carrying a subject, a type and an issued-at time; validity is checked against
// Date.now(), so the 30s access / 10min refresh lifetimes are real.

export const ACCESS_TTL_MS = 30_000;
export const REFRESH_TTL_MS = 10 * 60_000;

export type Role = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
}

export interface Order {
  id: string;
  item: string;
  total: number;
}

export interface AdminStats {
  users: number;
  revenue: number;
  openTickets: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface Account {
  password: string;
  user: User;
}

const ACCOUNTS: Record<string, Account> = {
  user: { password: 'password', user: { id: 'u1', username: 'user', name: 'Casey User', role: 'user' } },
  admin: { password: 'password', user: { id: 'u2', username: 'admin', name: 'Dana Admin', role: 'admin' } },
};

const ORDERS: Order[] = [
  { id: 'o-1001', item: 'Mechanical keyboard', total: 129 },
  { id: 'o-1002', item: 'USB-C hub', total: 45 },
  { id: 'o-1003', item: '27" monitor', total: 319 },
];

const STATS: AdminStats = { users: 1048, revenue: 84210, openTickets: 7 };

type TokenType = 'access' | 'refresh';
interface TokenPayload {
  sub: string;
  type: TokenType;
  iat: number;
}

function issue(sub: string, type: TokenType): string {
  const payload: TokenPayload = { sub, type, iat: Date.now() };
  return btoa(JSON.stringify(payload));
}

function decode(token: string): TokenPayload | null {
  try {
    return JSON.parse(atob(token)) as TokenPayload;
  } catch {
    return null;
  }
}

function findUser(id: string): User | undefined {
  return Object.values(ACCOUNTS).find((account) => account.user.id === id)?.user;
}

/** Validates an access token and returns the user, or throws a 401. */
function authenticate(token: string | null): User {
  const payload = token ? decode(token) : null;
  if (!payload || payload.type !== 'access') throw new ApiError(401, 'Missing or invalid access token');
  if (Date.now() - payload.iat > ACCESS_TTL_MS) throw new ApiError(401, 'Access token expired');
  const user = findUser(payload.sub);
  if (!user) throw new ApiError(401, 'Unknown user');
  return user;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const account = ACCOUNTS[username.trim().toLowerCase()];
  if (!account || account.password !== password) {
    throw new ApiError(401, 'Invalid username or password');
  }
  return {
    accessToken: issue(account.user.id, 'access'),
    refreshToken: issue(account.user.id, 'refresh'),
    user: account.user,
  };
}

export async function refresh(refreshToken: string): Promise<{ accessToken: string }> {
  const payload = decode(refreshToken);
  if (!payload || payload.type !== 'refresh') throw new ApiError(401, 'Invalid refresh token');
  if (Date.now() - payload.iat > REFRESH_TTL_MS) throw new ApiError(401, 'Refresh token expired');
  if (!findUser(payload.sub)) throw new ApiError(401, 'Unknown user');
  return { accessToken: issue(payload.sub, 'access') };
}

export async function me(accessToken: string | null): Promise<User> {
  return authenticate(accessToken);
}

export async function getOrders(accessToken: string | null): Promise<Order[]> {
  authenticate(accessToken);
  return ORDERS;
}

export async function getAdminStats(accessToken: string | null): Promise<AdminStats> {
  const user = authenticate(accessToken);
  if (user.role !== 'admin') throw new ApiError(403, 'Admins only');
  return STATS;
}
