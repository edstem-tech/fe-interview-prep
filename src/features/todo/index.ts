import type { Feature } from '../types';
import TodoApp from './TodoApp';

export const todoFeature: Feature = {
  id: 'q1',
  path: 'todo',
  title: 'Todo App',
  tagline: 'Add, toggle, filter and clear tasks, persisted to localStorage.',
  Component: TodoApp,
};
