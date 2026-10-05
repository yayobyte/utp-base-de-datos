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
  // NEXT_PUBLIC_*: variables públicas que la integración Supabase ↔ Vercel crea y mantiene (URL + publishable key).
  // Nunca añadir aquí prefijos de variables secretas (SUPABASE_, POSTGRES_).
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  define: {
    __BUILD_INFO__: JSON.stringify(buildInfo),
  },
  build: {
    // El chunk más grande (~590 kB) es PGlite y solo se descarga al abrir /punto-2 (import dinámico).
    chunkSizeWarningLimit: 650,
  },
  // PGlite (PostgreSQL en WebAssembly, punto 2) carga sus .wasm/.data por su cuenta: no pre-empaquetar.
  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    // Varias pruebas arrancan PostgreSQL (PGlite) y rutas diferidas en paralelo: margen para máquinas cargadas.
    testTimeout: 15_000,
    // Las pruebas no dependen del .env.local del desarrollador: cada prueba simula lo que necesita.
    env: {
      VITE_P1_SUPABASE_URL: '',
      VITE_P1_SUPABASE_ANON_KEY: '',
      VITE_P2_SUPABASE_URL: '',
      VITE_P2_SUPABASE_ANON_KEY: '',
      NEXT_PUBLIC_SUPABASE_URL: '',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
    },
    globals: true,
  },
})
