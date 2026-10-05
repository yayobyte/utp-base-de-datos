import { useCallback, useEffect, useState } from 'react'
import { DataError } from '@/data'

export interface Notice {
  tone: 'success' | 'error' | 'info'
  message: string
}

/**
 * Ejecuta acciones que modifican datos: muestra el resultado (aviso) y luego refresca.
 * `busy` permite deshabilitar botones mientras corre la acción.
 */
/** Los avisos de éxito se ocultan solos; los de error quedan hasta cerrarlos. */
export const SUCCESS_NOTICE_MS = 5000

export function useRunner(refresh?: () => unknown) {
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice>()

  useEffect(() => {
    if (notice?.tone !== 'success') return
    const t = setTimeout(() => setNotice(undefined), SUCCESS_NOTICE_MS)
    return () => clearTimeout(t)
  }, [notice])

  const run = useCallback(
    async <T,>(fn: () => Promise<T>, success?: string | ((r: T) => string)): Promise<T | undefined> => {
      setBusy(true)
      setNotice(undefined)
      try {
        const result = await fn()
        if (success) setNotice({ tone: 'success', message: typeof success === 'function' ? success(result) : success })
        return result
      } catch (e) {
        setNotice({ tone: 'error', message: DataError.from(e).message })
        return undefined
      } finally {
        setBusy(false)
        await refresh?.()
      }
    },
    [refresh],
  )

  return { run, busy, notice, clearNotice: () => setNotice(undefined) }
}
