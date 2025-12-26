import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'vite-bundle-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    plugins: [
      react(),
      // Bundle analyzer - only in production builds
      isProduction && visualizer({
        open: false,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    server: {
      port: 5178,
      strictPort: false, // Allow Vite to try next available port if 5178 is taken
    },
    // Exclude markdown files from being processed
    build: {
      rollupOptions: {
        // Exclude markdown files from build
        external: (id) => {
          return id.endsWith('.md') || id.includes('/docs/') || id.includes('README')
        },
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
            'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
            'charts-vendor': ['recharts', '@mui/x-charts'],
            'socket-vendor': ['socket.io-client'],
          },
        },
      },
      // Performance optimizations
      minify: 'esbuild',
      sourcemap: !isProduction,
      chunkSizeWarningLimit: 1000, // Warn if chunk exceeds 1MB
    },
    // Performance optimizations
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@reduxjs/toolkit',
        'react-redux',
      ],
    },
  }
})
