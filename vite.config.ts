import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self';",
        "script-src 'self' 'unsafe-inline' https://*.google.com https://*.gstatic.com;",
        "style-src 'self' 'unsafe-inline' https://*.googleapis.com;", 
        "font-src 'self' https://*.gstatic.com;",
        "frame-src https://*.google.com;",
        "frame-ancestors 'self';",
        "connect-src 'self' https://*.google.com https://*.gstatic.com https://*.googleapis.com ws://localhost:*;",
        "img-src 'self' data: https:;",
        "base-uri 'self';"
      ].join(' '),
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN'
    }
  }
})
