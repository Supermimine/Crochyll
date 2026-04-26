import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self';",
    "script-src 'self' 'unsafe-inline' https://*.google.com https://*.gstatic.com https://www.paypal.com https://c.paypal.com https://www.sandbox.paypal.com;",
    "style-src 'self' 'unsafe-inline' https://*.googleapis.com https://www.paypal.com https://www.sandbox.paypal.com;",
    "font-src 'self' https://*.gstatic.com;",
    "frame-src https://*.google.com https://www.paypal.com https://c.paypal.com https://www.sandbox.paypal.com;",
    "frame-ancestors 'self';",
    "connect-src 'self' https://*.google.com https://*.gstatic.com https://*.googleapis.com https://www.paypal.com https://c.paypal.com https://api.paypal.com https://www.sandbox.paypal.com ws://localhost:*;",
    "img-src 'self' data: https:;",
    "base-uri 'self';"
  ].join(' '),
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN'
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    headers: securityHeaders,
  },
  preview: {
    headers: securityHeaders,
  },
})
