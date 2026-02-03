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
