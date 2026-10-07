import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocalStorage } from '../../lib/useLocalStorage';
import { FILTERS, type Filter, type Todo } from './types';

function parseFilter(value: string | null): Filter {
  return (FILTERS as readonly string[]).includes(value ?? '') ? (value as Filter) : 'all';
}

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
  /** Reordering is only meaningful on the unfiltered list. */
  canReorder: boolean;
  setFilter: (filter: Filter) => void;
  add: (title: string) => void;
  edit: (id: string, title: string) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  move: (fromIndex: number, toIndex: number) => void;
  clearCompleted: () => void;
}

/**
 * Owns the todo list and the active filter. The list is persisted to localStorage;
 * the filter lives in the URL query string (`?filter=active`), so it survives a
 * refresh *and* is shareable/back-forward friendly. Derived values (`visible`,
 * `remaining`) are memoised so the list only recomputes when todos or the filter
 * change.
 */
export function useTodos(keyPrefix = 'q1'): TodosApi {
  const [todos, setTodos] = useLocalStorage<Todo[]>(`${keyPrefix}.todos`, []);
  const [params, setParams] = useSearchParams();
  const filter = parseFilter(params.get('filter'));

  const setFilter = useCallback(
    (next: Filter) => {
      setParams(
        (prev) => {
          const search = new URLSearchParams(prev);
          if (next === 'all') search.delete('filter');
          else search.set('filter', next);
          return search;
        },
        { replace: true },
      );
    },
    [setParams],
  );

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

  function move(fromIndex: number, toIndex: number): void {
    if (fromIndex === toIndex) return;
    setTodos((prev) => {
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      if (!moved) return prev;
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  return {
    todos,
    visible,
    filter,
    remaining,
    hasCompleted,
    canReorder: filter === 'all',
    setFilter,
    add,
    edit,
    toggle,
    remove,
    move,
    clearCompleted,
  };
}
