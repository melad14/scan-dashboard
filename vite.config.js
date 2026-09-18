import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Function form: the object form is rejected by Vite's rolldown bundler
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\/](react|react-dom|react-router-dom|scheduler)[\/]/.test(id)) return 'vendor'
          if (/[\/](framer-motion|lucide-react|react-hot-toast)[\/]/.test(id)) return 'ui'
        }
      }
    }
  }
})
