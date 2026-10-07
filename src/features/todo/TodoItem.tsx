import { useState, type KeyboardEvent } from 'react';
import type { Todo } from './types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onRemove: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onEdit, onRemove }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);

  function startEditing(): void {
    setDraft(todo.title);
    setEditing(true);
  }

  function commit(): void {
    onEdit(todo.id, draft);
    setEditing(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') commit();
    if (event.key === 'Escape') {
      setDraft(todo.title);
      setEditing(false);
    }
  }

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'active' : 'completed'}`}
        className="size-4 accent-indigo-600"
      />

      {editing ? (
        <input
          autoFocus
          aria-label={`Edit "${todo.title}"`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-md border border-indigo-400 px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-200"
        />
      ) : (
        <button
          type="button"
          onDoubleClick={startEditing}
          className={`flex-1 cursor-text text-left ${
            todo.completed ? 'text-slate-400 line-through' : ''
          }`}
          title="Double-click to edit"
        >
          {todo.title}
        </button>
      )}

      {!editing && (
        <button
          type="button"
          onClick={startEditing}
          className="text-sm text-slate-400 transition hover:text-indigo-600"
        >
          Edit
        </button>
      )}
      <button
        type="button"
        onClick={() => onRemove(todo.id)}
        aria-label={`Delete "${todo.title}"`}
        className="text-sm text-slate-400 transition hover:text-red-600"
      >
        Delete
      </button>
    </li>
  );
}
