import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { getAntdTheme } from './theme'

const themeCss = fs.readFileSync(path.resolve(process.cwd(), 'src/theme.css'), 'utf-8')

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

describe('theme.css tokens', () => {
  it('exposes motion and elevation tokens', () => {
    expect(themeCss).toContain('--shadow-2')
    expect(themeCss).toContain('--motion-slow')
    expect(themeCss).toContain('--space-4')
  })
})
