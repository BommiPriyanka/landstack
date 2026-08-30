import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: false,
    host: '0.0.0.0',
    watch: {
      // Prevent Vite from restarting when .env or config files change
      ignored: ['**/.env', '**/.env.*', '**/vite.config.*', '**/node_modules/**'],
    },
  },
  preview: {
    port: 5174,
    strictPort: false,
    host: '0.0.0.0',
  },
});
