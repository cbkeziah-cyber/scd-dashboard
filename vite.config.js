import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-dom/client'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'recharts', 'lucide-react', 'react-router-dom'],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',
    headers: {
      'Cache-Control': 'no-store',
    },
  },
})
