/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_P1_SUPABASE_URL?: string
  readonly VITE_P1_SUPABASE_ANON_KEY?: string
  readonly VITE_P2_SUPABASE_URL?: string
  readonly VITE_P2_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Inyectado por vite.config.ts (define). */
declare const __BUILD_INFO__: {
  commit: string
  branch: string
  environment: string
  builtAt: string
}
