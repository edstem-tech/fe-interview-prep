import type { Feature } from '../types';
import UsersTable from './UsersTable';

export const tableFeature: Feature = {
  id: 'q4',
  path: 'data-table',
  title: 'Data Table',
  tagline: 'A reusable sortable/filterable table with the view shareable via the URL.',
  Component: UsersTable,
};
