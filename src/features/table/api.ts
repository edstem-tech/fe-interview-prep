import type { WithId } from './types';

export interface UserRow extends WithId {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  city: string;
  country: string;
  age: number;
}

interface RandomUser {
  login: { uuid: string };
  name: { first: string; last: string };
  email: string;
  gender: string;
  location: { city: string; country: string };
  dob: { age: number };
}

/**
 * Fetches a large, deterministic set of users (seeded, so the dataset — and any
 * shared link into it — is stable across loads). Returns flat rows the table can
 * read through its column accessors.
 */
export async function fetchUsers(signal?: AbortSignal): Promise<UserRow[]> {
  const url =
    'https://randomuser.me/api/?results=1000&seed=feprep&inc=name,email,location,gender,dob,login&noinfo';
  const response = await fetch(url, signal ? { signal } : undefined);
  if (!response.ok) throw new Error(`Failed to load users (${response.status})`);
  const data = (await response.json()) as { results: RandomUser[] };
  return data.results.map((user) => ({
    id: user.login.uuid,
    firstName: user.name.first,
    lastName: user.name.last,
    email: user.email,
    gender: user.gender,
    city: user.location.city,
    country: user.location.country,
    age: user.dob.age,
  }));
}
