'use client'

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react'

export const THEMES = [
  {
    id: 'amber',
    name: 'Sunset Amber',
    tagline: 'Warm Cinematic Gold',
    accent: '#f7931e',
    glow: 'rgba(247, 147, 30, 0.4)',
    preview: ['#f8d5b0', '#f5954a', '#e85500'],
  },
  {
    id: 'cyber',
    name: 'Cyber Cyan',
    tagline: 'Deep Sci-Fi Neon',
    accent: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.4)',
    preview: ['#1e293b', '#0f766e', '#06b6d4'],
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    tagline: 'Organic Aurora Glow',
    accent: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    preview: ['#1c3d2e', '#059669', '#10b981'],
  },
  {
    id: 'crimson',
    name: 'Crimson Rose',
    tagline: 'Vibrant Velvet Neon',
    accent: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.4)',
    preview: ['#4c0519', '#be123c', '#f43f5e'],
  },
  {
    id: 'violet',
    name: 'Electric Violet',
    tagline: 'Cosmic Royal Mystique',
    accent: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.4)',
    preview: ['#311042', '#7e22ce', '#a855f7'],
  },
  {
    id: 'obsidian',
    name: 'Obsidian Mono',
    tagline: 'Minimal Stealth Titanium',
    accent: '#e4e4e7',
    glow: 'rgba(228, 228, 231, 0.4)',
    preview: ['#3f3f46', '#27272a', '#09090b'],
  },
]

const listeners = new Set()

function getThemeSnapshot() {
  if (typeof window === 'undefined') return 'amber'
  try {
    const saved = localStorage.getItem('portfolio_theme')
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved
    }
  } catch {
    // ignore
  }
  return 'amber'
}

function getServerSnapshot() {
  return 'amber'
}

function subscribeTheme(callback) {
  listeners.add(callback)
  const onStorage = (e) => {
    if (e.key === 'portfolio_theme') {
      callback()
    }
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage)
  }
  return () => {
    listeners.delete(callback)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage)
    }
  }
}

function notifyThemeListeners() {
  listeners.forEach((cb) => {
    try {
      cb()
    } catch {
      // ignore
    }
  })
}

const ThemeContext = createContext({
  theme: 'amber',
  currentTheme: THEMES[0],
  setTheme: () => {},
  cycleTheme: () => {},
  themes: THEMES,
})

export function ThemeProvider({ children }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerSnapshot)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = (newThemeId) => {
    if (!THEMES.some((t) => t.id === newThemeId)) return
    try {
      localStorage.setItem('portfolio_theme', newThemeId)
      document.documentElement.setAttribute('data-theme', newThemeId)
      notifyThemeListeners()
    } catch (e) {
      console.warn('Could not persist theme to localStorage', e)
    }
  }

  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex((t) => t.id === theme)
    const nextIndex = (currentIndex + 1) % THEMES.length
    setTheme(THEMES[nextIndex].id)
  }

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0]

  return (
    <ThemeContext.Provider
      value={{
        theme,
        currentTheme,
        setTheme,
        cycleTheme,
        themes: THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
