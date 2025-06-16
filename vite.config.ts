import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          chess: ['chess.js', 'react-chessboard']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['vite.dwx.my.id'] 
  },
  preview: {
    port: 4173,
    host: true
  }
})
