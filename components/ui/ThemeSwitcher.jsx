'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Palette, Check, Sparkles, X } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import styles from '@/styles/ui/ThemeSwitcher.module.css'

export default function ThemeSwitcher({ variant = 'floating' }) {
  const { theme, currentTheme, setTheme, themes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  // Variant 1: Mobile drawer grid
  if (variant === 'mobile') {
    return (
      <div className="w-full flex flex-col items-center gap-2 mt-2">
        <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
          <Palette className="w-3 h-3 text-orange-400" />
          <span>Cinematic Theme</span>
        </span>
        <div className={styles.mobileThemeGrid}>
          {themes.map((t) => {
            const isActive = t.id === theme
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`${styles.mobileThemeCard} ${isActive ? styles.mobileThemeCardActive : ''}`}
                title={t.name}
              >
                <div
                  className={styles.swatch}
                  style={{
                    background: `linear-gradient(135deg, ${t.preview[0]} 0%, ${t.preview[1]} 50%, ${t.preview[2]} 100%)`,
                    borderColor: isActive ? '#ffffff' : 'rgba(255,255,255,0.3)',
                  }}
                />
                <span className="truncate max-w-[80px]">{t.name.split(' ')[0]}</span>
                {isActive && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Variant 2: Navbar compact button with dropdown
  if (variant === 'navbar') {
    return (
      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={styles.navThemeBtn}
          title={`Theme: ${currentTheme.name}`}
          aria-label="Change Theme"
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: currentTheme.accent,
              boxShadow: `0 0 6px ${currentTheme.accent}`,
            }}
          />
          <Palette className="w-3.5 h-3.5 opacity-80" />
          <span className="hidden lg:inline text-[11px] font-medium">{currentTheme.name.split(' ')[0]}</span>
        </button>

        {isOpen && (
          <div className={styles.panelNavbar}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: currentTheme.accent }} />
                <span>Color Palette</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className={styles.themeList}>
              {themes.map((t) => {
                const isActive = t.id === theme
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id)
                      setIsOpen(false)
                    }}
                    className={`${styles.themeItem} ${isActive ? styles.themeItemActive : ''}`}
                  >
                    <div className={styles.themeLeft}>
                      <div
                        className={styles.swatch}
                        style={{
                          background: `linear-gradient(135deg, ${t.preview[0]} 0%, ${t.preview[1]} 50%, ${t.preview[2]} 100%)`,
                          borderColor: isActive ? '#fff' : 'rgba(255,255,255,0.3)',
                        }}
                      />
                      <div className={styles.themeInfo}>
                        <span className={styles.themeName}>{t.name}</span>
                        <span className={styles.themeTagline}>{t.tagline}</span>
                      </div>
                    </div>
                    {isActive && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Variant 3: Floating toggle on bottom-left
  return (
    <div className={styles.floatingWrap} ref={panelRef}>
      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: currentTheme.accent }} />
              <span>Palette Selector</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className={styles.themeList}>
            {themes.map((t) => {
              const isActive = t.id === theme
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id)
                    setIsOpen(false)
                  }}
                  className={`${styles.themeItem} ${isActive ? styles.themeItemActive : ''}`}
                >
                  <div className={styles.themeLeft}>
                    <div
                      className={styles.swatch}
                      style={{
                        background: `linear-gradient(135deg, ${t.preview[0]} 0%, ${t.preview[1]} 50%, ${t.preview[2]} 100%)`,
                        borderColor: isActive ? '#fff' : 'rgba(255,255,255,0.3)',
                      }}
                    />
                    <div className={styles.themeInfo}>
                      <span className={styles.themeName}>{t.name}</span>
                      <span className={styles.themeTagline}>{t.tagline}</span>
                    </div>
                  </div>
                  {isActive && (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.floatingBtn}
        aria-label="Toggle Theme Switcher"
        title={`Theme: ${currentTheme.name}`}
      >
        <div className={styles.pulseGlow} />
        <Palette className="w-5 h-5 text-white relative z-10" />
      </button>
    </div>
  )
}
