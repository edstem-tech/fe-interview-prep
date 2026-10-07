import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoApp from './TodoApp';

function addTodo(text: string) {
  return userEvent.type(screen.getByLabelText('New todo'), `${text}{Enter}`);
}

describe('TodoApp', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('adds todos and clears the input', async () => {
    render(<TodoApp />);
    await addTodo('Write tests');

    expect(screen.getByText('Write tests')).toBeInTheDocument();
    expect(screen.getByLabelText('New todo')).toHaveValue('');
    expect(screen.getByText('1 item left')).toBeInTheDocument();
  });

  it('ignores whitespace-only input', async () => {
    render(<TodoApp />);
    await addTodo('   ');
    expect(screen.getByText('No todos here.')).toBeInTheDocument();
  });

  it('toggles completion and updates the remaining count', async () => {
    render(<TodoApp />);
    await addTodo('Ship it');

    await userEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByText('0 items left')).toBeInTheDocument();
  });

  it('edits a todo title', async () => {
    render(<TodoApp />);
    await addTodo('Old title');

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const input = screen.getByLabelText('Edit "Old title"');
    await userEvent.clear(input);
    await userEvent.type(input, 'New title{Enter}');

    expect(screen.getByText('New title')).toBeInTheDocument();
    expect(screen.queryByText('Old title')).not.toBeInTheDocument();
  });

  it('filters by active and completed', async () => {
    render(<TodoApp />);
    await addTodo('Keep me active');
    await addTodo('Complete me');

    const list = screen.getByRole('list');
    await userEvent.click(screen.getByLabelText('Mark "Complete me" as completed'));

    await userEvent.click(screen.getByRole('button', { name: /^active$/i }));
    expect(within(list).getByText('Keep me active')).toBeInTheDocument();
    expect(within(list).queryByText('Complete me')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^completed$/i }));
    expect(within(list).getByText('Complete me')).toBeInTheDocument();
    expect(within(list).queryByText('Keep me active')).not.toBeInTheDocument();
  });

  it('deletes a todo and clears completed', async () => {
    render(<TodoApp />);
    await addTodo('Delete me');
    await userEvent.click(screen.getByLabelText('Delete "Delete me"'));
    expect(screen.getByText('No todos here.')).toBeInTheDocument();

    await addTodo('Done soon');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: 'Clear completed' }));
    expect(screen.getByText('No todos here.')).toBeInTheDocument();
  });

  it('persists todos and the selected filter across a remount (refresh)', async () => {
    const { unmount } = render(<TodoApp />);
    await addTodo('Survive refresh');
    await userEvent.click(screen.getByRole('button', { name: /^active$/i }));
    unmount();

    // Re-mounting reads straight from localStorage, like a page reload would.
    render(<TodoApp />);
    expect(screen.getByText('Survive refresh')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^active$/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
