'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import { DraggableContainer, GridBody, GridItem } from '@/components/ui/infinite-drag-scroll'
import styles from '@/styles/sections/CertificationsSection.module.css'

const CERTS = profile.certifications

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
        <DraggableContainer variant="masonry">
          <GridBody>
            {CERTS.map((cert) => (
              <GridItem key={cert.id} className={styles.certTile}>
                <img
                  src={cert.image}
                  alt={`${cert.title} certificate from ${cert.issuer}`}
                  className={styles.certImg}
                  draggable={false}
                />
              </GridItem>
            ))}
          </GridBody>
        </DraggableContainer>
      </div>

    </section>
  )
}
