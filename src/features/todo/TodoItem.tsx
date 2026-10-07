import { useState, type KeyboardEvent } from 'react';
import type { Todo } from './types';

interface TodoItemProps {
  todo: Todo;
  index: number;
  draggable: boolean;
  isOver: boolean;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onRemove: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: (index: number) => void;
  onDragEnd: () => void;
  onMoveByKey: (index: number, direction: -1 | 1) => void;
}

export default function TodoItem({
  todo,
  index,
  draggable,
  isOver,
  onToggle,
  onEdit,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMoveByKey,
}: TodoItemProps) {
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

  function handleEditKey(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') commit();
    if (event.key === 'Escape') {
      setDraft(todo.title);
      setEditing(false);
    }
  }

  function handleHandleKey(event: KeyboardEvent<HTMLButtonElement>): void {
    // Keyboard alternative to dragging: move the item up/down.
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      onMoveByKey(index, -1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      onMoveByKey(index, 1);
    }
  }

  return (
    <li
      draggable={draggable && !editing}
      onDragStart={() => onDragStart(index)}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver(index);
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(index);
      }}
      onDragEnd={onDragEnd}
      className={`flex items-center gap-3 px-4 py-3 ${isOver ? 'bg-indigo-50' : ''}`}
    >
      {draggable && (
        <button
          type="button"
          aria-label={`Reorder "${todo.title}" (use arrow keys)`}
          onKeyDown={handleHandleKey}
          className="cursor-grab text-slate-400 hover:text-slate-700"
          title="Drag, or focus and use ↑/↓"
        >
          ⠿
        </button>
      )}

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
          onKeyDown={handleEditKey}
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
