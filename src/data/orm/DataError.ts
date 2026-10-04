export type DataErrorCode = 'not_configured' | 'not_found' | 'query_failed' | 'network'

/** Error normalizado de la capa de datos: la UI solo conoce este tipo. */
export class DataError extends Error {
  readonly code: DataErrorCode
  readonly details?: string

  constructor(message: string, code: DataErrorCode = 'query_failed', details?: string) {
    super(message)
    this.name = 'DataError'
    this.code = code
    this.details = details
  }

  /** Convierte un error de supabase-js (PostgrestError) o desconocido en DataError. */
  static from(error: unknown, fallback = 'Error al consultar la base de datos'): DataError {
    if (error instanceof DataError) return error
    if (error && typeof error === 'object' && 'message' in error) {
      const e = error as { message: string; details?: string | null; hint?: string | null }
      const network = /fetch|network/i.test(e.message)
      return new DataError(e.message || fallback, network ? 'network' : 'query_failed', e.details ?? e.hint ?? undefined)
    }
    return new DataError(fallback)
  }
}
