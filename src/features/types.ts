import type { ComponentType } from 'react';

/**
 * One interview question = one feature. Each feature PR appends an entry to the
 * registry; the router and the home page are both generated from that list, so a
 * feature is wired into the app by adding exactly one `Feature` object.
 */
export interface Feature {
  /** Stable id, e.g. "q1". */
  id: string;
  /** Route path (no leading slash), e.g. "todo". */
  path: string;
  /** Human title shown in nav and on the home card. */
  title: string;
  /** One-line description shown on the home card. */
  tagline: string;
  /** The page component rendered at `/{path}`. */
  Component: ComponentType;
}
