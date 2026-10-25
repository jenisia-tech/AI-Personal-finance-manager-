import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for FinIntel AI (Bubblegum & Lace theme)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
