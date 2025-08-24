import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173,
    allowedHosts: ['map.zen20.com', '162.43.6.225', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  preview: {
    allowedHosts: ['sugi.masadon-room.click', 'map.zen20.com', '162.43.6.225', 'localhost', '127.0.0.1']
  }
})
