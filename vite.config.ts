import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      input: "index.html",  // ✅ Ensure correct entry point
    },
    outDir: "dist"  // Ensure this is "dist"
  }
});
