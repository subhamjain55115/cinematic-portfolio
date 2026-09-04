'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import Navbar                from '@/components/ui/Navbar'
import VideoIntro            from '@/components/sections/VideoIntro'
import HeroSection           from '@/components/sections/HeroSection'
import AboutSection          from '@/components/sections/AboutSection'
import ProjectsSection       from '@/components/sections/ProjectsSection'
import ServicesSection       from '@/components/sections/ServicesSection'
import WorkExperienceSection from '@/components/sections/WorkExperienceSection'
import CertificationsSection from '@/components/sections/CertificationsSection'
import PublicationsFooterSection from '@/components/sections/PublicationsFooterSection'
import ScreenLoader from '@/components/sections/ScreenLoader'

export default function Home() {
  const totalSlides    = 10

  const mainRef        = useRef(null)
  const idxRef         = useRef(0)
  const busyRef        = useRef(false)
  const tweenRef       = useRef(null)
  const loopOverlayRef = useRef(null)
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    const total = 10

    // Detect if an event target is inside a scrollable container
    function getScrollableParent(target) {
      let node = target
      while (node && node !== el && node !== document.body) {
        if (node.getAttribute?.('data-scrollable') === 'true') {
          return node
        }
        if (node.classList?.contains('scrollable-container')) {
          return node
        }
        try {
          const style = window.getComputedStyle(node)
          const overflowY = style.overflowY
          if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight + 4) {
            return node
          }
        } catch {
          // ignore
        }
        node = node.parentElement
      }
      return null
    }

    // Fade to black → instant scrollTop jump → fade in
    // Used whenever we loop footer → first section
    function fadeLoop(targetScrollTop, targetIdx) {
      busyRef.current = true
      tweenRef.current?.kill()
      gsap.to(loopOverlayRef.current, {
        opacity: 1,
        duration: 0.55,
        ease: 'power2.in',
        onComplete: () => {
          el.scrollTop    = targetScrollTop
          idxRef.current  = targetIdx
          gsap.to(loopOverlayRef.current, {
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
            delay: 0.05,
            onComplete: () => {
              setTimeout(() => { busyRef.current = false }, 300)
            },
          })
        },
      })
    }

    function goTo(idx) {
      // Wrap-around
      if (idx >= total) idx = 0
      if (idx < 0)      idx = total - 1

      if (idx === idxRef.current || busyRef.current) return

      // Footer → top: fade-cut instead of scrolling back through all sections
      if (idxRef.current === total - 1 && idx === 0) {
        fadeLoop(0, 0)
        return
      }

      // Top → footer: fade-cut instead of scrolling forward through all sections
      if (idxRef.current === 0 && idx === total - 1) {
        fadeLoop((total - 1) * window.innerHeight, total - 1)
        return
      }

      idxRef.current = idx
      busyRef.current = true
      tweenRef.current?.kill()
      tweenRef.current = gsap.to(el, {
        scrollTop: idx * window.innerHeight,
        duration: 1.0,
        ease: 'power3.inOut',
        onComplete: () => { setTimeout(() => { busyRef.current = false }, 600) },
      })
    }

    let atEdgeTimer = 0
    function onWheel(e) {
      const scrollable = getScrollableParent(e.target)
      if (scrollable) {
        const delta = e.deltaY
        const { scrollTop, scrollHeight, clientHeight } = scrollable
        const canScrollDown = delta > 0 && scrollTop + clientHeight < scrollHeight - 6
        const canScrollUp   = delta < 0 && scrollTop > 6

        if (canScrollDown || canScrollUp) {
          atEdgeTimer = 0
          return
        }

        // At scroll boundary
        const now = Date.now()
        if (!atEdgeTimer) {
          atEdgeTimer = now
          e.preventDefault()
          return
        }
        if (now - atEdgeTimer < 350) {
          e.preventDefault()
          return
        }
        atEdgeTimer = 0
      }

      e.preventDefault()
      if (busyRef.current) return
      goTo(idxRef.current + (e.deltaY > 0 ? 1 : -1))
    }

    let touchY = 0
    let touchTarget = null
    function onTouchStart(e) {
      touchY = e.touches[0].clientY
      touchTarget = e.target
    }
    function onTouchEnd(e) {
      const scrollable = getScrollableParent(touchTarget)
      if (scrollable) {
        const dy = touchY - e.changedTouches[0].clientY
        const { scrollTop, scrollHeight, clientHeight } = scrollable
        const canScrollDown = dy > 0 && scrollTop + clientHeight < scrollHeight - 10
        const canScrollUp   = dy < 0 && scrollTop > 10
        if (canScrollDown || canScrollUp) {
          return
        }
      }
      const dy = touchY - e.changedTouches[0].clientY
      if (Math.abs(dy) < 40 || busyRef.current) return
      goTo(idxRef.current + (dy > 0 ? 1 : -1))
    }

    function onScroll() {
      idxRef.current = Math.round(el.scrollTop / window.innerHeight)
    }

    // Footer video ends → same fade-cut loop back to top
    function onFooterLoop() {
      if (busyRef.current) return
      fadeLoop(0, 0)
    }

    const isMobile = window.matchMedia('(max-width: 767px)').matches

    el.addEventListener('wheel',  onWheel,  { passive: false })
    el.addEventListener('scroll', onScroll, { passive: true  })

    let mTouchY = 0
    let mTouchTarget = null
    function onMobileTouchStart(e) {
      mTouchY = e.touches[0].clientY
      mTouchTarget = e.target
    }
    function onMobileTouchEnd(e) {
      const scrollable = getScrollableParent(mTouchTarget)
      if (scrollable) {
        const dy = mTouchY - e.changedTouches[0].clientY
        const { scrollTop, scrollHeight, clientHeight } = scrollable
        const canScrollDown = dy > 0 && scrollTop + clientHeight < scrollHeight - 10
        const canScrollUp   = dy < 0 && scrollTop > 10
        if (canScrollDown || canScrollUp) {
          return
        }
      }
      const dy = mTouchY - e.changedTouches[0].clientY
      if (Math.abs(dy) < 40) return
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8
      const atTop    = el.scrollTop < 8
      if (dy > 0 && atBottom) fadeLoop(0, 0)
      if (dy < 0 && atTop)    fadeLoop(el.scrollHeight - el.clientHeight, total - 1)
      else if (Math.abs(dy) >= 40 && !busyRef.current) goTo(idxRef.current + (dy > 0 ? 1 : -1))
    }

    if (!isMobile) {
      el.addEventListener('touchstart', onTouchStart, { passive: true })
      el.addEventListener('touchend',   onTouchEnd,   { passive: true })
    } else {
      el.addEventListener('touchstart', onMobileTouchStart, { passive: true })
      el.addEventListener('touchend',   onMobileTouchEnd,   { passive: true })
    }
    window.addEventListener('footer-loop-back', onFooterLoop)

    return () => {
      el.removeEventListener('wheel',  onWheel)
      el.removeEventListener('scroll', onScroll)
      if (!isMobile) {
        el.removeEventListener('touchstart', onTouchStart)
        el.removeEventListener('touchend',   onTouchEnd)
      } else {
        el.removeEventListener('touchstart', onMobileTouchStart)
        el.removeEventListener('touchend',   onMobileTouchEnd)
      }
      window.removeEventListener('footer-loop-back', onFooterLoop)
      tweenRef.current?.kill()
    }
  }, [])

  return (
    <>
      {showLoader && (
        <ScreenLoader onDismiss={() => setShowLoader(false)} />
      )}

      {/* Full-screen fade overlay for seamless footer → top loop */}
      <div
        ref={loopOverlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#000',
          zIndex: 9999,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      <Navbar />
      <main ref={mainRef} style={{ height: '100vh', overflowY: 'scroll', overscrollBehavior: 'none' }}>
        <div>
          <VideoIntro />
          <HeroSection />
          <AboutSection />
          <ProjectsSection />
          <ServicesSection />
          <WorkExperienceSection />
          <CertificationsSection />
          <PublicationsFooterSection />
        </div>
      </main>
    </>
  )
}
