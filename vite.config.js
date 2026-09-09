import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@phosphor-icons')) return 'icons';
            if (id.includes('react') || id.includes('react-router')) return 'vendor';
          }
        }
      }
    }
  }
})
