import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,
  },
  server: { host: '0.0.0.0', port: 5173, strictPort: true, allowedHosts: true, hmr: { overlay: false }, watch: { usePolling: true, interval: 100 } },
});
