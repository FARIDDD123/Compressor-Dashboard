import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const isProduction = mode === 'production'
  
  // Dynamically import visualizer only in production
  let visualizer = null
  if (isProduction) {
    try {
      const { visualizer: viz } = await import('vite-bundle-visualizer')
      visualizer = viz
    } catch (e) {
      console.warn('Bundle visualizer not available:', e.message)
    }
  }
  
  return {
    plugins: [
      react({
        // Fix for React hooks issues
        jsxRuntime: 'automatic',
      }),
      // Bundle analyzer - only in production builds
      visualizer && visualizer({
        open: false,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    resolve: {
      // Dedupe React and other dependencies to prevent multiple instances
      dedupe: [
        'react',
        'react-dom',
        'react-router-dom',
        '@emotion/react',
        '@emotion/styled',
      ],
      alias: {
        // Ensure single instance of React
        'react': path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        '@emotion/react': path.resolve(__dirname, './node_modules/@emotion/react'),
        '@emotion/styled': path.resolve(__dirname, './node_modules/@emotion/styled'),
      },
    },
    server: {
      port: 5178,
      strictPort: false, // Allow Vite to try next available port if 5178 is taken
      hmr: {
        // Fix WebSocket connection issues
        protocol: 'ws',
        host: 'localhost',
        port: 5178,
      },
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
        'react-window',
        '@emotion/react',
        '@emotion/styled',
        '@mui/material',
        '@mui/icons-material',
      ],
      // Force re-optimization to fix duplicate dependency issues
      force: false,
    },
  }
})
