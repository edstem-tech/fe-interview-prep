import type { Feature } from './types';

/**
 * The ordered list of interview features. Each feature branch (Q1..Q5) appends
 * exactly one entry here and the rest of the app (nav, home cards, routes) picks
 * it up automatically. Kept intentionally empty on a fresh `main`.
 */
export const features: Feature[] = [];
