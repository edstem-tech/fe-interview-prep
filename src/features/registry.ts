import type { Feature } from './types';
import { todoFeature } from './todo';
import { searchFeature } from './search';
import { wizardFeature } from './wizard';

/**
 * The ordered list of interview features. Each feature branch (Q1..Q5) appends
 * exactly one entry here and the rest of the app (nav, home cards, routes) picks
 * it up automatically.
 */
export const features: Feature[] = [todoFeature, searchFeature, wizardFeature];
