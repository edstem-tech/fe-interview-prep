import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Test runner config. Kept separate from vite.config.ts so the build config stays
// clean and the Vitest types augment the config without clashing with build plugins.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
