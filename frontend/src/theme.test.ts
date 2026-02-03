import { describe, it, expect } from 'vitest'
import { getAntdTheme } from './theme'

describe('getAntdTheme', () => {
  it('returns light tokens when darkMode is false', () => {
    const theme = getAntdTheme(false)
    expect(theme.token?.colorBgBase).toBe('#f6f7f9')
  })

  it('returns dark tokens when darkMode is true', () => {
    const theme = getAntdTheme(true)
    expect(theme.token?.colorBgBase).toBe('#0f1115')
  })
})
