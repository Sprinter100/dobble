import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const env = loadEnv('', process.cwd());

console.log(env.VITE_BACKEND_HOST)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: env.VITE_BACKEND_HOST,
        changeOrigin: true
      },
      '/socket.io': {
        target: env.VITE_BACKEND_HOST,
        changeOrigin: true,
        ws: true
      }
    }
  }
})
