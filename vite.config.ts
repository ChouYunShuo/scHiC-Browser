import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // base: process.env.NODE_ENV === 'production' ? '/cellscope/' : '/',
  plugins: [
    react(),
  ],
  server: {
    host: true,
    port: 8082, // This is the port which we will use in docker
  }
})
