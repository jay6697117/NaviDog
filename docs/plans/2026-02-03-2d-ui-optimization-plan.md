# 2D UI Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 建立可维护的 2D 视觉与交互基线（主题 token + CSS 变量 + 组件级样式），统一亮/暗主题一致性与微动效反馈。

**Architecture:** 通过 `ConfigProvider` 统一 AntD token；用 `data-theme` 驱动 CSS 变量层；核心布局与高频组件通过全局样式统一层级、间距与动效。

**Tech Stack:** React 18, Ant Design 5, Vite 5, TypeScript, Vitest, React Testing Library

### Task 1: 测试工具与基础用例

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/vite.config.ts`
- Create: `frontend/src/test/setupTests.ts`

**Step 1: Write the failing test**

```tsx
// frontend/src/theme.test.ts
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run frontend/src/theme.test.ts`
Expected: FAIL with "Cannot find module './theme'" or similar

**Step 3: Write minimal implementation**

```ts
// frontend/src/theme.ts
import { theme as antdTheme } from 'antd'
import type { ThemeConfig } from 'antd'

export const getAntdTheme = (darkMode: boolean): ThemeConfig => {
  const isDark = Boolean(darkMode)
  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: isDark ? '#6aa7ff' : '#2563eb',
      colorBgBase: isDark ? '#0f1115' : '#f6f7f9',
      colorBgContainer: isDark ? '#141821' : '#ffffff',
      colorBgLayout: isDark ? '#0b0d12' : '#f2f4f7',
      colorBorder: isDark ? '#242a36' : '#e6e8ec',
      colorText: isDark ? '#e6e8ee' : '#1f2328',
      colorTextSecondary: isDark ? '#a2acc0' : '#5b667a',
      borderRadius: 8,
      fontSize: 13,
      lineHeight: 1.5,
      controlHeight: 28
    }
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run frontend/src/theme.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/package.json frontend/vite.config.ts frontend/src/test/setupTests.ts frontend/src/theme.test.ts frontend/src/theme.ts

git commit -m "test: add vitest and theme token tests"
```

### Task 2: App 主题绑定与最小 UI 基线

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/App.css`
- Create: `frontend/src/theme.css`
- Create: `frontend/src/App.test.tsx`

**Step 1: Write the failing test**

```tsx
// frontend/src/App.test.tsx
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run frontend/src/App.test.tsx`
Expected: FAIL because `data-theme` not set

**Step 3: Write minimal implementation**

- 在 `App.tsx` 引入 `getAntdTheme`
- 使用 `useEffect` 设置 `document.documentElement.dataset.theme`
- 去掉对 `document.body.style` 的直接写入
- 添加布局类名并引入 `theme.css`

```tsx
// App.tsx (excerpt)
import { getAntdTheme } from './theme'
import './theme.css'

useEffect(() => {
  document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
}, [darkMode])

<ConfigProvider theme={getAntdTheme(darkMode)}>
  <Layout className="app-shell">
    <Sider className="app-sider" width={sidebarWidth}>
      ...
    </Sider>
    <Content className="app-content">...
  </Layout>
</ConfigProvider>
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run frontend/src/App.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/App.tsx frontend/src/App.css frontend/src/theme.css frontend/src/App.test.tsx

git commit -m "feat: bind theme tokens and base 2D styles"
```

### Task 3: 全局样式与微交互统一

**Files:**
- Modify: `frontend/src/theme.css`
- Modify: `frontend/src/App.css`

**Step 1: Write the failing test**

```tsx
// frontend/src/App.test.tsx (append)
import { screen } from '@testing-library/react'

it('renders layout containers with expected classes', () => {
  render(<App />)
  expect(document.querySelector('.app-shell')).toBeTruthy()
  expect(document.querySelector('.app-sider')).toBeTruthy()
  expect(document.querySelector('.app-content')).toBeTruthy()
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run frontend/src/App.test.tsx`
Expected: FAIL if classes missing

**Step 3: Write minimal implementation**

- 在 `theme.css` 定义变量与基础层级（base/panel/elevated）
- 为按钮、树节点、Tabs 添加统一过渡与 hover/active 反馈

**Step 4: Run test to verify it passes**

Run: `npm test -- --run frontend/src/App.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/theme.css frontend/src/App.css frontend/src/App.test.tsx

git commit -m "style: add global tokens and micro-interactions"
```

### Task 4: 回归验证与整理

**Files:**
- Modify: `progress.md`
- Modify: `task_plan.md`

**Step 1: Run tests**

Run: `npm test`
Expected: PASS

**Step 2: Manual checks**

- 亮/暗主题切换
- 侧边栏、Tabs、表格区域层级与对比度
- hover/active 反馈

**Step 3: Update progress**

记录测试结果与发现

**Step 4: Commit**

```bash
git add progress.md task_plan.md

git commit -m "chore: record verification results"
```
