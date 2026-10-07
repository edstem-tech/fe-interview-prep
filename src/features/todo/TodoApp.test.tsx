import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import TodoApp from './TodoApp';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="search">{location.search}</div>;
}

function renderTodo(url = '/todo') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <TodoApp />
      <LocationProbe />
    </MemoryRouter>,
  );
}

function addTodo(text: string) {
  return userEvent.type(screen.getByLabelText('New todo'), `${text}{Enter}`);
}

function titleOrder(): (string | null)[] {
  return screen
    .getAllByRole('button', { name: /^(Alpha|Beta|Gamma)$/ })
    .map((button) => button.textContent);
}

describe('TodoApp', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('adds todos and clears the input', async () => {
    renderTodo();
    await addTodo('Write tests');
    expect(screen.getByText('Write tests')).toBeInTheDocument();
    expect(screen.getByLabelText('New todo')).toHaveValue('');
    expect(screen.getByText('1 item left')).toBeInTheDocument();
  });

  it('ignores whitespace-only input', async () => {
    renderTodo();
    await addTodo('   ');
    expect(screen.getByText('No todos here.')).toBeInTheDocument();
  });

  it('toggles completion and updates the remaining count', async () => {
    renderTodo();
    await addTodo('Ship it');
    await userEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByText('0 items left')).toBeInTheDocument();
  });

  it('edits a todo title', async () => {
    renderTodo();
    await addTodo('Old title');
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const input = screen.getByLabelText('Edit "Old title"');
    await userEvent.clear(input);
    await userEvent.type(input, 'New title{Enter}');
    expect(screen.getByText('New title')).toBeInTheDocument();
    expect(screen.queryByText('Old title')).not.toBeInTheDocument();
  });

  it('writes the active filter to the URL and filters the list', async () => {
    renderTodo();
    await addTodo('Keep me active');
    await addTodo('Complete me');
    await userEvent.click(screen.getByLabelText('Mark "Complete me" as completed'));

    await userEvent.click(screen.getByRole('button', { name: /^active$/i }));
    expect(screen.getByTestId('search').textContent).toContain('filter=active');
    const list = screen.getByRole('list');
    expect(within(list).queryByText('Complete me')).not.toBeInTheDocument();
  });

  it('restores the filter from the URL on load', () => {
    window.localStorage.setItem(
      'q1.todos',
      JSON.stringify([
        { id: '1', title: 'Active one', completed: false },
        { id: '2', title: 'Done one', completed: true },
      ]),
    );
    renderTodo('/todo?filter=completed');

    // The "completed" filter came straight from the URL.
    expect(screen.getByRole('button', { name: /^completed$/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('Done one')).toBeInTheDocument();
    expect(screen.queryByText('Active one')).not.toBeInTheDocument();
  });

  it('persists todos across a remount (refresh)', async () => {
    const { unmount } = renderTodo();
    await addTodo('Survive refresh');
    unmount();
    renderTodo();
    expect(screen.getByText('Survive refresh')).toBeInTheDocument();
  });

  it('reorders todos with the keyboard handle', async () => {
    renderTodo();
    await addTodo('Alpha');
    await addTodo('Beta');
    await addTodo('Gamma');
    expect(titleOrder()).toEqual(['Alpha', 'Beta', 'Gamma']);

    const handle = screen.getByRole('button', { name: /Reorder "Alpha"/ });
    handle.focus();
    await userEvent.keyboard('{ArrowDown}');

    expect(titleOrder()).toEqual(['Beta', 'Alpha', 'Gamma']);
  });
});
