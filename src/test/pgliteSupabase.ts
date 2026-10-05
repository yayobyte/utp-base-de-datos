import type { PGlite } from '@electric-sql/pglite'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente supabase-js mínimo que ejecuta las RPC contra PGlite (solo pruebas).
 * Soporta `rpc(nombre, { arg: valor })` para funciones de public.
 */
export function pgliteSupabase(db: PGlite): SupabaseClient {
  return {
    rpc: async (fn: string, params: Record<string, unknown> = {}) => {
      const names = Object.keys(params)
      const args = names.map((n, i) => `${n} => $${i + 1}`).join(', ')
      try {
        const r = await db.query<{ r: unknown }>(`select public.${fn}(${args}) as r`, names.map((n) => params[n]))
        return { data: r.rows[0]?.r ?? null, error: null }
      } catch (e) {
        return { data: null, error: { message: (e as Error).message } }
      }
    },
  } as unknown as SupabaseClient
}
