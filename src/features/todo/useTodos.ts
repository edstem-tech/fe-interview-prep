import { useMemo } from 'react';
import { useLocalStorage } from '../../lib/useLocalStorage';
import type { Filter, Todo } from './types';

let idCounter = 0;
function createId(): string {
  idCounter += 1;
  return `${Date.now().toString(36)}-${idCounter}`;
}

export interface TodosApi {
  todos: Todo[];
  visible: Todo[];
  filter: Filter;
  remaining: number;
  hasCompleted: boolean;
  setFilter: (filter: Filter) => void;
  add: (title: string) => void;
  edit: (id: string, title: string) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clearCompleted: () => void;
}

/**
 * Owns the todo list and the active filter. Both are persisted to localStorage so
 * they survive a refresh (per the spec). Derived values (`visible`, `remaining`)
 * are memoised so the list only recomputes when todos or the filter change.
 */
export function useTodos(keyPrefix = 'q1'): TodosApi {
  const [todos, setTodos] = useLocalStorage<Todo[]>(`${keyPrefix}.todos`, []);
  const [filter, setFilter] = useLocalStorage<Filter>(`${keyPrefix}.filter`, 'all');

  const visible = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      case 'all':
        return todos;
    }
  }, [todos, filter]);

  const remaining = useMemo(() => todos.filter((todo) => !todo.completed).length, [todos]);
  const hasCompleted = useMemo(() => todos.some((todo) => todo.completed), [todos]);

  function add(title: string): void {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTodos((prev) => [...prev, { id: createId(), title: trimmed, completed: false }]);
  }

  function edit(id: string, title: string): void {
    const trimmed = title.trim();
    // Emptying a todo's title deletes it (standard TodoMVC behaviour).
    if (!trimmed) {
      remove(id);
      return;
    }
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, title: trimmed } : todo)),
    );
  }

  function toggle(id: string): void {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    );
  }

  function remove(id: string): void {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  function clearCompleted(): void {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  }

  return {
    todos,
    visible,
    filter,
    remaining,
    hasCompleted,
    setFilter,
    add,
    edit,
    toggle,
    remove,
    clearCompleted,
  };
}
