import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useInteractiveLoading } from '../app/hooks/use-interactive-loading'

describe('useInteractiveLoading', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('manages loading lifecycle', () => {
    const { result } = renderHook(() => useInteractiveLoading())

    act(() => {
      result.current.start()
    })

    expect(result.current.loading.isLoading).toBe(true)

    act(() => {
      result.current.finish()
    })

    expect(result.current.loading.isLoading).toBe(false)
    expect(result.current.loading.progress).toBe(100)
  })
})
