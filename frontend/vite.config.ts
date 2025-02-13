import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 80,
    allowedHosts: [
      '2ca3-2804-7f0-7c80-ec2-7d40-b615-8650-26b9.ngrok-free.app'
    ]
  }
})
