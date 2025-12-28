import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5178,
    strictPort: false // Allow Vite to try next available port if 5178 is taken
  },
  // Exclude markdown files from being processed
  build: {
    rollupOptions: {
      // Exclude markdown files from build
      external: (id) => {
        return id.endsWith('.md') || id.includes('/docs/') || id.includes('README')
      }
    }
  }
})
