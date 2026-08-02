'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import BentoGallery from '@/components/ui/bento-gallery'
import styles from '@/styles/sections/CertificationsSection.module.css'

// Repeating bento pattern - one big feature tile, two stacked tiles, one
// tall tile, one short tile, one wide tile, then it cycles.
const SPAN_PATTERN = [
  'md:col-span-2 md:row-span-2',
  'md:row-span-1',
  'md:row-span-1',
  'md:row-span-2',
  'md:row-span-1',
  'md:col-span-2 md:row-span-1',
]

// Most recent first
const CERTS = [...profile.certifications].sort(
  (a, b) => new Date(b.date) - new Date(a.date),
)
const GALLERY_ITEMS = CERTS.map((cert, i) => ({
  id: cert.id,
  title: cert.title,
  desc: cert.issuer,
  url: cert.image,
  span: SPAN_PATTERN[i % SPAN_PATTERN.length],
}))

export default function CertificationsSection() {
  const sectionRef = useRef(null)
  const headerRef   = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const scroller = document.querySelector('main')
    if (!scroller) return

    let isActive = false

    function resetAnim() {
      gsap.set(headerRef.current, { opacity: 0, y: 20 })
    }

    function playAnim() {
      resetAnim()
      gsap.to(headerRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
    }

    resetAnim()

    function onScroll() {
      const inRange = Math.abs(scroller.scrollTop - section.offsetTop) < window.innerHeight * 0.5
      if (inRange && !isActive)  { isActive = true;  playAnim() }
      if (!inRange && isActive)  { isActive = false; resetAnim() }
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section ref={sectionRef} className={styles.section}>

      <div ref={headerRef} className={styles.header}>
        <span className={styles.label}>Certifications</span>
        <span className={styles.labelRight}>0{CERTS.length} Credentials &middot; Drag to explore</span>
      </div>

      <div className={styles.galleryArea}>
        <BentoGallery items={GALLERY_ITEMS} />
      </div>

    </section>
  )
}
