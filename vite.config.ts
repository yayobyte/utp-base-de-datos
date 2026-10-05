/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
// Datos del build visibles en /estado. Vercel define VERCEL_* durante el build.
const buildInfo = {
  commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
  branch: process.env.VERCEL_GIT_COMMIT_REF ?? 'local',
  environment: process.env.VERCEL_ENV ?? 'development',
  builtAt: new Date().toISOString(),
}

/**
 * Vercel no permite crear variables con prefijo de framework (VITE_*). Para la BD #2 se aceptan
 * nombres sin prefijo y se copian, de forma explícita, a las variables que lee la app.
 * Lista cerrada: solo URL y publishable key (valores públicos por diseño). Nunca añadir llaves secretas.
 */
const PUBLIC_ALIASES: Record<string, string> = {
  VITE_P2_SUPABASE_URL: 'P2_SUPABASE_URL',
  VITE_P2_SUPABASE_ANON_KEY: 'P2_SUPABASE_ANON_KEY',
}

function aliasDefines(mode: string): Record<string, string> {
  // En Vitest cada prueba simula sus variables (vi.stubEnv); un reemplazo estático lo impediría.
  if (process.env.VITEST) return {}
  const env = loadEnv(mode, process.cwd(), '')
  const defines: Record<string, string> = {}
  for (const [target, source] of Object.entries(PUBLIC_ALIASES)) {
    const value = env[target] || env[source]
    if (value) defines[`import.meta.env.${target}`] = JSON.stringify(value)
  }
  return defines
}

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // NEXT_PUBLIC_*: variables públicas que la integración Supabase ↔ Vercel crea y mantiene (URL + publishable key).
  // Nunca añadir aquí prefijos de variables secretas (SUPABASE_, POSTGRES_).
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  define: {
    __BUILD_INFO__: JSON.stringify(buildInfo),
    ...aliasDefines(mode),
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
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
}))
