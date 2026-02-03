import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

const storeState = {
  darkMode: true,
  toggleDarkMode: vi.fn(),
  addTab: vi.fn(),
  activeContext: null,
  connections: [],
  addConnection: vi.fn(),
  tabs: [],
  activeTabId: null
}

vi.mock('./store', () => ({
  useStore: () => storeState
}))

vi.mock('./components/Sidebar', () => ({
  default: () => <div data-testid="sidebar" />
}))

vi.mock('./components/TabManager', () => ({
  default: () => <div data-testid="tabs" />
}))

vi.mock('./components/ConnectionModal', () => ({
  default: () => null
}))

vi.mock('./components/DataSyncModal', () => ({
  default: () => null
}))

vi.mock('./components/LogPanel', () => ({
  default: () => null
}))

describe('App theme', () => {
  it('applies dark theme to document element', () => {
    render(<App />)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('applies light theme when darkMode is false', () => {
    storeState.darkMode = false
    render(<App />)
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})

describe('App layout', () => {
  it('renders layout containers with expected classes', () => {
    render(<App />)
    expect(document.querySelector('.app-shell')).toBeTruthy()
    expect(document.querySelector('.app-sider')).toBeTruthy()
    expect(document.querySelector('.app-content')).toBeTruthy()
  })
})
