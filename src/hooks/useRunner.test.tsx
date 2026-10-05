import { act, renderHook } from '@testing-library/react'
import { SUCCESS_NOTICE_MS, useRunner } from './useRunner'

describe('useRunner', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('el aviso de éxito se oculta solo; el de error se queda', async () => {
    const { result } = renderHook(() => useRunner())
    await act(() => result.current.run(async () => 1, 'Listo'))
    expect(result.current.notice).toEqual({ tone: 'success', message: 'Listo' })
    act(() => vi.advanceTimersByTime(SUCCESS_NOTICE_MS))
    expect(result.current.notice).toBeUndefined()

    await act(() => result.current.run(async () => Promise.reject(new Error('Falló'))))
    act(() => vi.advanceTimersByTime(SUCCESS_NOTICE_MS * 2))
    expect(result.current.notice).toEqual({ tone: 'error', message: 'Falló' })
  })
})
