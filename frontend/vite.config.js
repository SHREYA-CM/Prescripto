import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    port: 5180, // Your existing port setting
    proxy: {    // <-- ADD THIS PROXY OBJECT
      '/api': {
        target: 'http://localhost:5000', // Change if your backend is on a different port
        changeOrigin: true,
      },
    },
  },
})