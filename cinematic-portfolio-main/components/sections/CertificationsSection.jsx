'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/CertificationsSection.module.css'

const GROUPS = profile.certifications
const TOTAL_CERTS = GROUPS.reduce((sum, g) => sum + g.items.length, 0)

export default function CertificationsSection() {
  const sectionRef = useRef(null)
  const cardRefs    = useRef([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const scroller = document.querySelector('main')
    if (!scroller) return

    let isActive = false

    function resetAnim() {
      cardRefs.current.forEach(el => el && gsap.set(el, { opacity: 0, y: 28 }))
    }

    function playAnim() {
      resetAnim()
      gsap.to(cardRefs.current.filter(Boolean), {
        opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1,
      })
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

      <div className={styles.header}>
        <span className={styles.label}>Certifications</span>
        <span className={styles.labelRight}>0{TOTAL_CERTS} Credentials</span>
      </div>

      <div className={styles.grid}>
        {GROUPS.map((group, i) => (
          <div
            key={group.issuer}
            ref={el => { cardRefs.current[i] = el }}
            className={styles.card}
          >
            <h2 className={styles.issuer}>{group.issuer}</h2>
            <span className={styles.count}>0{group.items.length} certificate{group.items.length > 1 ? 's' : ''}</span>
            <ul className={styles.list}>
              {group.items.map(item => (
                <li key={item.title} className={styles.item}>
                  <span className={styles.itemDot} aria-hidden />
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

    </section>
  )
}
