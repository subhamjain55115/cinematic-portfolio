'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import { usePortfolio } from '@/context/PortfolioContext'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher'
import styles from '@/styles/ui/Navbar.module.css'
import { FaBars, FaTimes } from 'react-icons/fa'

export default function Navbar() {
  const { projects, isAdmin } = usePortfolio()
  const [onIntro, setOnIntro] = useState(true)
  const [onDark,  setOnDark]  = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef   = useRef(null)
  const lastY       = useRef(0)
  const hidden      = useRef(false)
  const stopTimer   = useRef(null)

  const navItems = [
    { label: 'Home',           idx: 0 },
    { label: 'About',          idx: 2 },
    { label: 'Projects',       idx: 3 },
    { label: 'Services',       idx: 4 },
    { label: 'Experience',     idx: 5 },
    { label: 'Certifications', idx: 6 },
    { label: 'Impact',         idx: 7 },
    { label: 'Contact',        idx: 9 },
  ]

  // Auto-hide on scroll-down, reveal on scroll-up or scroll-stop
  useEffect(() => {
    const scroller = document.querySelector('main') ?? window
    const vh = window.innerHeight

    function showNavbar() {
      if (!hidden.current) return
      gsap.to(headerRef.current, { y: '0%', duration: 0.35, ease: 'power2.out' })
      hidden.current = false
    }

    const onScroll = () => {
      const currentY = scroller.scrollTop ?? window.scrollY
      const delta    = currentY - lastY.current

      const sectionIdx = Math.round(currentY / vh)
      setOnIntro(currentY < vh * 0.8)
      setOnDark(sectionIdx >= 3)

      if (delta > 8 && !hidden.current) {
        gsap.to(headerRef.current, { y: '-100%', duration: 0.35, ease: 'power2.inOut' })
        hidden.current = true
      } else if (delta < -6) {
        showNavbar()
      }

      lastY.current = currentY

      // Show navbar 400 ms after scrolling stops
      clearTimeout(stopTimer.current)
      stopTimer.current = setTimeout(showNavbar, 400)
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      clearTimeout(stopTimer.current)
    }
  }, [])

  return (
    <>
      <header ref={headerRef} className={`${styles.header} ${onIntro ? styles.introMode : ''} ${onDark ? styles.darkMode : ''}`}>
        <div className={styles.navLeft} />

        <NavigationMenu className={styles.navMenu}>
          <NavigationMenuList className="flex gap-6 items-center">
            {navItems.map(({ label, idx }) => (
              <NavigationMenuItem key={label}>
                <NavigationMenuLink
                  className={styles.navLink}
                  onClick={() => {
                    const scroller = document.querySelector('main')
                    if (scroller) gsap.to(scroller, {
                      scrollTop: idx * window.innerHeight,
                      duration: 1.0,
                      ease: 'power3.inOut',
                    })
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="text-xs px-3 py-1.5 rounded-full border border-orange-400/40 text-orange-500 hover:bg-orange-500/10 transition-colors font-medium"
            title="Admin Portal"
          >
            Admin
          </Link>

          <a
            href={`mailto:${profile.email}`}
            className={`${styles.emailBtn} rounded-full text-xs font-semibold px-5 h-8`}
          >
            Email me
          </a>
        </div>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </header>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <button
            className={styles.mobileCloseBtn}
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes size={18} />
          </button>

          {navItems.map(({ label, idx }) => (
            <button
              key={label}
              className={styles.mobileNavLink}
              onClick={() => {
                const scroller = document.querySelector('main')
                if (scroller) gsap.to(scroller, {
                  scrollTop: idx * window.innerHeight,
                  duration: 1.0,
                  ease: 'power3.inOut',
                })
                setMenuOpen(false)
              }}
            >
              {label}
            </button>
          ))}
          <Link
            href="/admin"
            className={styles.mobileAdminLink}
            onClick={() => setMenuOpen(false)}
          >
            Admin Portal
          </Link>

          <ThemeSwitcher variant="mobile" />

          <a
            href={`mailto:${profile.email}`}
            className={styles.mobileMailLink}
            onClick={() => setMenuOpen(false)}
          >
            {profile.email}
          </a>
        </div>
      )}
    </>
  )
}
