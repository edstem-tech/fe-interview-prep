import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/ — build + dev server. Test config lives in vitest.config.ts.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
