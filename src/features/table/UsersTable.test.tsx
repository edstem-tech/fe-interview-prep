import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import UsersTable from './UsersTable';
import { fetchUsers, type UserRow } from './api';

vi.mock('./api', () => ({ fetchUsers: vi.fn() }));
const mockedFetch = vi.mocked(fetchUsers);

function user(n: number, gender: 'male' | 'female', age: number): UserRow {
  return {
    id: `u${n}`,
    firstName: `First${n}`,
    lastName: `Last${n}`,
    email: `user${n}@example.com`,
    gender,
    city: `City${n}`,
    country: 'Testland',
    age,
  };
}

// 15 rows: 6 female (ids 1-6), 9 male (ids 7-15). Oldest female is u3 (age 60).
const DATA: UserRow[] = [
  user(1, 'female', 22),
  user(2, 'female', 31),
  user(3, 'female', 60),
  user(4, 'female', 48),
  user(5, 'female', 27),
  user(6, 'female', 40),
  ...Array.from({ length: 9 }, (_, i) => user(i + 7, 'male', 20 + i)),
];

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="search">{location.search}</div>;
}

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <UsersTable />
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe('UsersTable', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
    mockedFetch.mockResolvedValue(DATA);
  });

  it('restores the exact view from a shared link (filter + sort)', async () => {
    renderAt('/data-table?gender=female&sort=age&dir=desc&size=10');
    await screen.findByText(/15 users/i);

    const bodyRows = screen.getAllByRole('row').slice(1); // drop header row
    // Only females, so no male row leaks in.
    expect(bodyRows).toHaveLength(6);
    // Sorted by age desc → oldest female (u3, First3) is first.
    expect(within(bodyRows[0]!).getByText('First3 Last3')).toBeInTheDocument();
    expect(screen.getByText(/page 1 of 1/i)).toBeInTheDocument();
  });

  it('returns to page 1 when a filter changes', async () => {
    renderAt('/data-table?size=10');
    await screen.findByText(/15 users/i);

    // 15 rows / 10 = 2 pages; go to page 2.
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument();
    expect(screen.getByTestId('search').textContent).toContain('page=2');

    // Changing the gender filter must drop back to page 1.
    await userEvent.selectOptions(screen.getByLabelText('Filter by gender'), 'female');
    expect(screen.getByText(/page 1 of 1/i)).toBeInTheDocument();
    const search = screen.getByTestId('search').textContent ?? '';
    expect(search).toContain('gender=female');
    expect(search).not.toContain('page=2');
  });
});
