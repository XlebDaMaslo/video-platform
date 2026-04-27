import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      // API запросы
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      // Медиафайлы — важно! Без этого браузер идёт напрямую на backend:8000
      // который не резолвится в браузере.
      '/media': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/static': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },
  },
});
