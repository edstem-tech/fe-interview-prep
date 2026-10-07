export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export const FILTERS = ['all', 'active', 'completed'] as const;
export type Filter = (typeof FILTERS)[number];
