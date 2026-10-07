import { useState, type FormEvent } from 'react';
import { FILTERS } from './types';
import { useTodos } from './useTodos';
import TodoItem from './TodoItem';

export default function TodoApp() {
  const todos = useTodos();
  const [draft, setDraft] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    todos.add(draft);
    setDraft('');
  }

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold">Todo App</h1>
      <p className="mt-1 text-sm text-slate-600">
        Add, complete, filter and clear tasks. The list persists across reloads.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
        <input
          aria-label="New todo"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="What needs doing?"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-40"
          disabled={draft.trim() === ''}
        >
          Add
        </button>
      </form>

      <div className="mt-4 flex gap-1" role="group" aria-label="Filter todos">
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={todos.filter === option}
            onClick={() => todos.setFilter(option)}
            className={`rounded-md px-3 py-1 text-sm capitalize transition ${
              todos.filter === option
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {todos.visible.length === 0 ? (
          <li className="px-4 py-8 text-center text-slate-400">No todos here.</li>
        ) : (
          todos.visible.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={todos.toggle}
              onEdit={todos.edit}
              onRemove={todos.remove}
            />
          ))
        )}
      </ul>

      <footer className="mt-3 flex items-center justify-between text-sm text-slate-500">
        <span>
          {todos.remaining} {todos.remaining === 1 ? 'item' : 'items'} left
        </span>
        {todos.hasCompleted && (
          <button
            type="button"
            onClick={todos.clearCompleted}
            className="transition hover:text-slate-900"
          >
            Clear completed
          </button>
        )}
      </footer>
    </section>
  );
}
