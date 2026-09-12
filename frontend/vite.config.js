import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// All backend requests now go through the API Gateway (Spring Cloud Gateway) on :8086,
// which routes to whichever of the 5 microservices owns that path. The frontend code
// itself is unchanged - only this proxy target moved from the old monolith's port.
// VITE_API_PROXY_TARGET lets docker-compose point this at the "api-gateway" container
// name instead of localhost when the frontend itself is also running in a container.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
