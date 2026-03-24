import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.QUIZ_API_URL ?? 'https://localhost:7229',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: '../wwwroot',
    emptyOutDir: true,
    assetsDir: '.',
    rollupOptions: {
      output: {
        entryFileNames: 'app.js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names.some((name) => name.endsWith('.css')))
          {
            return 'app.css';
          }

          return 'assets/[name][extname]';
        }
      }
    }
  }
});
