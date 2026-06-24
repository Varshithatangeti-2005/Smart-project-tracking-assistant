import React, { createContext, useContext, useEffect, useState } from 'react'

type BuiltinTheme = 'miracle' | 'light'
export type ThemeName = BuiltinTheme | 'system' | 'custom'

interface ThemeTokens {
  [key: string]: string
}

interface ThemeContextType {
  theme: ThemeName
  setTheme: (t: ThemeName, tokens?: ThemeTokens) => void
  toggleTheme: () => void
  themes: BuiltinTheme[]
}

const builtinThemes: Record<BuiltinTheme, ThemeTokens> = {
  miracle: {
    '--bg': '#0f172a',
    '--surface': '#111827',
    '--surface-2': '#1f2937',
    '--surface-3': '#374151',
    '--text': '#e2e8f0',
    '--text-muted': '#94a3b8',
    '--heading': '#f8fafc',
    '--border': '#334155',
    '--accent': '#00AEEF',
    '--accent-strong': '#007BB3',
    '--accent-soft': 'rgba(0, 174, 239, 0.12)',
  },
  light: {
    '--bg': '#f7fbff',
    '--surface': '#ffffff',
    '--surface-2': '#f1f5f9',
    '--surface-3': '#e2e8f0',
    '--text': '#071133',
    '--text-muted': '#475569',
    '--heading': '#071133',
    '--border': '#e6eef6',
    '--accent': '#00AEEF',
    '--accent-strong': '#007BB3',
    '--accent-soft': 'rgba(0, 174, 239, 0.08)',
  },
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'miracle',
  setTheme: () => {},
  toggleTheme: () => {},
  themes: ['miracle', 'light'],
})

function applyTokens(tokens: ThemeTokens) {
  const root = document.documentElement
  Object.entries(tokens).forEach(([k, v]) => {
    try {
      root.style.setProperty(k, v)
    } catch (e) {
      // ignore invalid values
    }
  })
}

function clearInlineTokens() {
  const root = document.documentElement
  Object.keys(builtinThemes.miracle).forEach((k) => root.style.removeProperty(k))
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    try {
      const stored = localStorage.getItem('theme') as ThemeName | null
      if (stored) return stored
      // respect system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? 'miracle' : 'light'
    } catch (e) {
      return 'miracle'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme)
    } catch (e) {
      // ignore
    }

    if (theme === 'system') {
      // apply system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      applyTokens(prefersDark ? builtinThemes.miracle : builtinThemes.light)
      document.documentElement.classList.remove('theme-miracle', 'theme-light')
    } else if (theme === 'custom') {
      // keep inline tokens (already applied by setTheme call)
      document.documentElement.classList.remove('theme-miracle', 'theme-light')
    } else {
      // builtin theme
      clearInlineTokens()
      document.documentElement.classList.remove('theme-miracle', 'theme-light')
      document.documentElement.classList.add(`theme-${theme}`)
      applyTokens(builtinThemes[theme as BuiltinTheme])
    }
  }, [theme])

  const setTheme = (t: ThemeName, tokens?: ThemeTokens) => {
    if (t === 'custom' && tokens) {
      applyTokens(tokens)
      setThemeState('custom')
      return
    }
    if (t !== 'custom') {
      setThemeState(t)
    }
  }

  const toggleTheme = () => setThemeState((s) => (s === 'miracle' ? 'light' : 'miracle'))

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themes: ['miracle', 'light'] }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)

export default ThemeContext
