import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// CabinConnect frontend — Vite + React + TypeScript strict.
// See TFD §2, §3 and Bolt 1 Units U-T01 (workspace) + U-007 (PWA).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // We ship public/manifest.webmanifest manually
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Critical-read caching (U-008) is deferred to Bolt 3 — this default config
        // only precaches the shell, no runtime cache rules yet.
      },
    }),
  ],
  resolve: {
    alias: {
      '@cabinconnect/shared-types': path.resolve(__dirname, '../shared/src/index.ts'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
