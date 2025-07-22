import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const env = loadEnv('', process.cwd());

console.log(env.VITE_BACKEND_HOST)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../backend/public',
    emptyOutDir: true,
  },
  server: {
    port: Number(env.VITE_BACKEND_PORT) || undefined,
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
