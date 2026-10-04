/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Datos del build visibles en /estado. Vercel define VERCEL_* durante el build.
const buildInfo = {
  commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
  branch: process.env.VERCEL_GIT_COMMIT_REF ?? 'local',
  environment: process.env.VERCEL_ENV ?? 'development',
  builtAt: new Date().toISOString(),
}

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_INFO__: JSON.stringify(buildInfo),
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
