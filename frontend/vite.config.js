import os from 'node:os'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Keep Vite's dependency cache outside Dropbox-synced folders to avoid
// Windows EBUSY rename errors while Dropbox locks node_modules/.vite.
const cacheDir = path.join(os.tmpdir(), 'tripbuddy-vite-cache')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  cacheDir,
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/health': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
