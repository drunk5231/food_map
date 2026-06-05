import { useEffect, useState, useCallback } from 'react'
import { cn } from '../../utils/cn'
import { STORAGE_KEYS } from '../../constants'

type Theme = 'light' | 'dark' | 'auto'

const STORAGE_KEY = STORAGE_KEYS.THEME

function getStoredTheme(): Theme {
  const val = localStorage.getItem(STORAGE_KEY)
  if (val === 'light' || val === 'dark' || val === 'auto') return val
  return 'auto'
}

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'auto' && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
}

// Sun icon (light mode)
function SunIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

// Moon icon (dark mode)
function MoonIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

// Auto icon (half-filled circle)
function AutoIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2 A10 10 0 0 1 12 22 Z" fill="currentColor" />
    </svg>
  )
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme)

  // Apply on mount and when theme changes
  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  // Listen for system preference changes when set to auto
  useEffect(() => {
    if (theme !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('auto')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const cycleTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'auto'
      return 'light'
    })
  }, [])

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        'min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-colors cursor-pointer',
        'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-primary)]',
        'dark:bg-[var(--color-dark-surface)] dark:text-[var(--color-dark-text)] dark:hover:bg-[var(--color-dark-border)] dark:hover:text-[var(--color-dark-primary)]'
      )}
      aria-label={`当前主题：${theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '跟随系统'}，点击切换`}
      title={theme === 'light' ? '浅色模式' : theme === 'dark' ? '深色模式' : '跟随系统'}
    >
      {theme === 'light' && <SunIcon />}
      {theme === 'dark' && <MoonIcon />}
      {theme === 'auto' && <AutoIcon />}
    </button>
  )
}
