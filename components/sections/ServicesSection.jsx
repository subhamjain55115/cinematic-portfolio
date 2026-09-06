'use client'

import { useMemo, useRef, useEffect } from 'react'
import {
  Globe,
  Layers,
  Smartphone,
  Bot,
  Palette,
  Cpu,
  Code,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  ArrowDown,
  Briefcase,
  Zap,
} from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { usePortfolio } from '@/context/PortfolioContext'
import profileData from '@/data/profile.json'
import styles from '@/styles/sections/ServicesSection.module.css'

const ICON_MAP = {
  Globe,
  Layers,
  Smartphone,
  Bot,
  Palette,
  Cpu,
  Code,
  Sparkles,
  Zap,
  Briefcase,
}

export default function ServicesSection() {
  const { services: liveServices } = usePortfolio()

  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const contentRef = useRef(null)

  const services = useMemo(() => {
    return liveServices && liveServices.length > 0 ? liveServices : profileData.services || []
  }, [liveServices])

  // Smooth wheel isolation so user can freely scroll up and down the services cards
  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    function onLocalWheel(e) {
      const { scrollTop, scrollHeight, clientHeight } = el
      const delta = e.deltaY
      const canScrollDown = delta > 0 && scrollTop + clientHeight < scrollHeight - 6
      const canScrollUp   = delta < 0 && scrollTop > 6

      if (canScrollDown || canScrollUp) {
        e.stopPropagation()
      }
    }

    el.addEventListener('wheel', onLocalWheel, { passive: true })
    return () => el.removeEventListener('wheel', onLocalWheel)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const tl = gsap.timeline({ paused: true })
    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      )
    }

    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          tl.play()
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(section)
    return () => {
      observer.disconnect()
      tl.kill()
    }
  }, [])

  return (
    <section ref={sectionRef} id="services-section" className={styles.section}>
      <div className={styles.ambientGlow} />

      {/* Header */}
      <div ref={headerRef} className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.label}>Expertise &amp; Architectural Capabilities</span>
          <h2 className={styles.title}>
            Core <span className={styles.titleMuted}>Services</span>
          </h2>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.totalBadge}>
            <Briefcase size={13} />
            <span>Specialized Offerings</span>
            <span className={styles.totalBadgeNum}>{services.length}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        ref={contentRef}
        className={styles.container}
        data-scrollable="true"
        tabIndex={0}
        aria-label="Core services showcase"
      >
        <div className={styles.servicesGrid} id="services-grid-view">
          {services.map((srv, idx) => {
            const IconComponent = ICON_MAP[srv.icon] || Globe
            const formattedOrder = String(srv.order || idx + 1).padStart(2, '0')
            const mailSubject = encodeURIComponent(`Service Inquiry: ${srv.title}`)
            const mailBody = encodeURIComponent(
              `Hi Subham,\n\nI am interested in your "${srv.title}" service for my project.\n\nProject Scope:\nTimeline:\n\nLooking forward to hearing from you!`
            )

            return (
              <div
                key={srv.id || idx}
                id={`service-card-${srv.id || idx}`}
                className={styles.serviceCard}
              >
                <div className={styles.cardTop}>
                  <div className={styles.iconBox}>
                    <IconComponent size={22} />
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.categoryTag}>{srv.category || 'Engineering'}</span>
                    <span className={styles.orderNum}>#{formattedOrder}</span>
                  </div>
                </div>

                <div>
                  <h3 className={styles.serviceTitle}>{srv.title}</h3>
                  <p className={styles.serviceDesc}>{srv.shortDesc}</p>

                  {Array.isArray(srv.features) && srv.features.length > 0 && (
                    <ul className={styles.featuresList}>
                      {srv.features.map((feature, fIdx) => (
                        <li key={fIdx} className={styles.featureItem}>
                          <CheckCircle2 size={13} className={styles.featureCheck} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className={styles.cardBottom}>
                  <div className={styles.techPills}>
                    {(srv.tech || []).slice(0, 3).map((t, tIdx) => (
                      <span key={tIdx} className={styles.techPill}>
                        {t}
                      </span>
                    ))}
                  </div>

                  <a
                    href={`mailto:shubham.rapariya2@gmail.com?subject=${mailSubject}&body=${mailBody}`}
                    className={styles.inquireBtn}
                    id={`inquire-btn-${srv.id || idx}`}
                  >
                    <span>Hire Me</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Banner & Next Section Cue */}
        <div className={styles.endOfShowcase}>
          <div className={styles.endOfShowcaseLine} />
          <div className={styles.endOfShowcaseContent}>
            <p className={styles.endOfShowcaseText}>
              Available for full-time frontend architecture roles &amp; high-impact consulting
            </p>
            <button
              type="button"
              className={styles.nextSectionBtn}
              onClick={() => {
                const scroller = document.querySelector('main')
                if (scroller) {
                  gsap.to(scroller, {
                    scrollTop: 5 * window.innerHeight,
                    duration: 1.0,
                    ease: 'power3.inOut',
                  })
                }
              }}
            >
              <span>Continue to Work Experience</span>
              <ArrowDown size={13} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
