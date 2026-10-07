import type { Feature } from '../types';
import AuthFeature from './AuthFeature';

export const authFeature: Feature = {
  id: 'q5',
  path: 'auth',
  title: 'Login & Session',
  tagline: 'Protected routes with silent, single-flight token refresh.',
  Component: AuthFeature,
};
