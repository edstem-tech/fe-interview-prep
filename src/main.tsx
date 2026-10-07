import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

function render(): void {
  createRoot(rootElement!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}

// Start the MSW worker first so the Q5 /api/* mock is in place before any request.
// Unmatched requests (randomuser, dummyjson) pass straight through.
import('./features/auth/server/browser')
  .then(({ worker }) => worker.start({ onUnhandledFrame: 'bypass', quiet: true }))
  .catch(() => undefined)
  .finally(render);
