import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Quan trọng: Giúp chạy được trên sub-folder của GitHub Pages
  build: {
    outDir: 'dist',
  }
});