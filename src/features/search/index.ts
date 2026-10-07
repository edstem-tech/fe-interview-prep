import type { Feature } from '../types';
import LiveSearch from './LiveSearch';

export const searchFeature: Feature = {
  id: 'q2',
  path: 'search',
  title: 'Live Search',
  tagline: 'Debounced product search that ignores out-of-order responses.',
  Component: LiveSearch,
};
