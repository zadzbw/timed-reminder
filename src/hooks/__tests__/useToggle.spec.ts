import { describe, it, expect } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useToggle } from '@/hooks/useToggle'

describe('`useToggle` hooks test', () => {
  it('should get correct value and toggle it', async () => {
    const { act, result } = renderHook(() => useToggle(true))
    const { toggle } = result.current

    expect(result.current.value).toBe(true)
    act(() => {
      toggle()
    })
    expect(result.current.value).toBe(false)
    act(() => {
      toggle()
    })
    expect(result.current.value).toBe(true)
  })
})
