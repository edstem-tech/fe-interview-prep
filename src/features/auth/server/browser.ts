import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Runs in the browser so the Q5 /api/* calls are real network requests you can see
// in the DevTools Network tab. Other hosts (randomuser, dummyjson) pass through.
export const worker = setupWorker(...handlers);
