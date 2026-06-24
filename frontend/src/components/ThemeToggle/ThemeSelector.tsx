import React from 'react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="theme-selector" role="toolbar" aria-label="Theme selector">
      <button
        className={`theme-btn ${theme === 'miracle' ? 'active' : ''}`}
        onClick={() => setTheme('miracle')}
        aria-pressed={theme === 'miracle'}
        title="Miracle theme"
      >
        <span className="swatch" style={{ background: 'linear-gradient(90deg,#00AEEF,#007BB3)' }} />
      </button>
      <button
        className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        title="Light theme"
      >
        <span className="swatch" style={{ background: 'linear-gradient(90deg,#fff,#e6eef6)', border: '1px solid #ccdbea' }} />
      </button>
      <button
        className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
        onClick={() => setTheme('system')}
        aria-pressed={theme === 'system'}
        title="Use system preference"
      >
        <span className="swatch" style={{ background: 'repeating-linear-gradient(45deg,#f0f6fb 0 6px,#eaf4fb 6px 12px)' }} />
      </button>
    </div>
  )
}
