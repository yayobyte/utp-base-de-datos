import type { SupabaseClient } from '@supabase/supabase-js'

export interface FakeResult {
  data?: unknown
  error?: { message: string; details?: string } | null
  count?: number | null
}

export interface FakeCall {
  method: string
  args: unknown[]
}

/** Cliente supabase-js simulado: registra la cadena de llamadas y resuelve con `result`. */
export function fakeSupabase(result: FakeResult = { data: [] }) {
  const calls: FakeCall[] = []
  const response = { data: result.data ?? null, error: result.error ?? null, count: result.count ?? null }

  const builder: Record<string, unknown> = {}
  for (const method of ['select', 'eq', 'is', 'order', 'limit', 'insert', 'update', 'delete']) {
    builder[method] = (...args: unknown[]) => {
      calls.push({ method, args })
      return builder
    }
  }
  builder.then = (resolve: (v: typeof response) => unknown) => Promise.resolve(response).then(resolve)

  const client = {
    from: (table: string) => {
      calls.push({ method: 'from', args: [table] })
      return builder
    },
    rpc: (fn: string, params?: unknown) => {
      calls.push({ method: 'rpc', args: [fn, params] })
      return Promise.resolve(response)
    },
  } as unknown as SupabaseClient

  return { client, calls, methods: () => calls.map((c) => c.method) }
}
