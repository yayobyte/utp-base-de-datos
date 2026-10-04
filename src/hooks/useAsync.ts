import { useCallback, useEffect, useRef, useState } from 'react'
import { DataError } from '@/data'

export interface AsyncState<T> {
  data: T | undefined
  error: DataError | undefined
  loading: boolean
  /** Vuelve a ejecutar la carga. */
  reload: () => Promise<void>
}

/** Ejecuta una función asíncrona al montar (y cuando cambian `deps`), con estado de carga y error. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = [], enabled = true): AsyncState<T> {
  const [data, setData] = useState<T>()
  const [error, setError] = useState<DataError>()
  const [loading, setLoading] = useState(enabled)
  const fnRef = useRef(fn)
  fnRef.current = fn

  const reload = useCallback(async () => {
    setLoading(true)
    setError(undefined)
    try {
      setData(await fnRef.current())
    } catch (e) {
      setError(DataError.from(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (enabled) void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reload, ...deps])

  return { data, error, loading, reload }
}
