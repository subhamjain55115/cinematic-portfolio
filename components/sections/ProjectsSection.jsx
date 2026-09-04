'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import profileData from '@/data/profile.json'
import { usePortfolio } from '@/context/PortfolioContext'
import styles from '@/styles/sections/ProjectsSection.module.css'
import {
  ExternalLink,
  ArrowDown,
} from 'lucide-react'
import { FaGithub } from 'react-icons/fa6'

function ProjectCardImage({ src, alt }) {
  const [errorSrc, setErrorSrc] = useState(null)
  const effectiveSrc =
    errorSrc === src
      ? '/assets/projects/crypto-tracker.png'
      : src || '/assets/projects/crypto-tracker.png'

  return (
    <Image
      src={effectiveSrc}
      alt={alt}
      fill
      sizes="(min-width: 768px) 33vw, 100vw"
      className={styles.projectImg}
      onError={() => {
        setErrorSrc(src)
      }}
    />
  )
}

function computeProjects(liveTemplates) {
  const defaultList = profileData.templates || []
  if (!liveTemplates || liveTemplates.length === 0) {
    return defaultList
  }
  const hasLegacySample = liveTemplates.some(
    (t) =>
      ['1', '2', '3', '4', '5', '6'].includes(String(t.id)) ||
      ['Aura Couture', 'Apex Capital', 'Velocity Turbo', 'BlinkMart Quick-Commerce', 'Pulse Eats', 'Zenith EduPortal'].includes(t.title)
  )
  if (hasLegacySample) {
    const customOnly = liveTemplates.filter(
      (t) =>
        !['1', '2', '3', '4', '5', '6'].includes(String(t.id)) &&
        !['Aura Couture', 'Apex Capital', 'Velocity Turbo', 'BlinkMart Quick-Commerce', 'Pulse Eats', 'Zenith EduPortal'].includes(t.title)
    )
    const merged = [...defaultList, ...customOnly]
    merged.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    return merged
  }
  const liveIds = new Set(liveTemplates.map((t) => String(t.id)))
  const missing = defaultList.filter((t) => !liveIds.has(String(t.id)))
  if (missing.length > 0 && liveTemplates.length < defaultList.length) {
    const merged = [...liveTemplates, ...missing]
    merged.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    return merged
  }
  const sorted = [...liveTemplates]
  sorted.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
  return sorted
}

export default function ProjectsSection() {
  const { templates: liveTemplates } = usePortfolio()
  const [selectedCategory, setSelectedCategory] = useState('All')

  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const contentRef = useRef(null)

  const projects = useMemo(() => computeProjects(liveTemplates), [liveTemplates])

  const categories = useMemo(() => {
    const cats = new Set(['All'])
    projects.forEach((p) => {
      if (p.category) cats.add(p.category)
    })
    return Array.from(cats)
  }, [projects])

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projects
    return projects.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase())
  }, [projects, selectedCategory])

  // Reset scroll position when switching category
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [selectedCategory])

  // Smooth wheel isolation so user can freely scroll up and down the full showcase
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
      { threshold: 0.15 }
    )

    observer.observe(section)
    return () => {
      observer.disconnect()
      tl.kill()
    }
  }, [])

  return (
    <section ref={sectionRef} id="projects-section" className={styles.section}>
      <div className={styles.ambientGlow} />

      {/* Header */}
      <div ref={headerRef} className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.label}>Portfolio &amp; Featured Builds</span>
          <h2 className={styles.title}>
            Featured <span className={styles.titleMuted}>Projects</span>
          </h2>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.totalBadge}>
            <span>Live Portfolio</span>
            <span className={styles.totalBadgeNum}>{projects.length}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        ref={contentRef}
        className={styles.container}
        data-scrollable="true"
        tabIndex={0}
        aria-label="Projects showcase"
      >
        <div id="projects-grid-view">
          {/* Category Filter + Scroll Cue */}
          <div className={styles.categoryBarWrap}>
            <div className={styles.categoryBar} role="group" aria-label="Category filters">
              {categories.map((cat) => (
                <button
                  key={cat}
                  id={`cat-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  className={`${styles.catBtn} ${selectedCategory === cat ? styles.catBtnActive : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className={styles.scrollIndicator}>
              <span>{filteredProjects.length} projects • Scroll to explore</span>
              <ArrowDown size={13} className={styles.scrollArrow} />
            </div>
          </div>

          {/* Projects Grid */}
          <div className={styles.projectsGrid}>
            {filteredProjects.map((proj, idx) => (
              <div
                key={proj.id || idx}
                id={`project-card-${proj.id || idx}`}
                className={styles.projectCard}
              >
                {/* Browser bar preview */}
                <div className={styles.browserHeader}>
                  <div className={styles.browserDots}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                  </div>
                  <div className={styles.browserUrl}>
                    {proj.previewUrl
                      ? proj.previewUrl.replace(/^https?:\/\//, '')
                      : `${proj.title.toLowerCase().replace(/\s+/g, '-')}.app`}
                  </div>
                  <div className={styles.liveTag}>
                    <span className={styles.livePulse} />
                    <span>Live</span>
                  </div>
                </div>

                {/* Screenshot */}
                <div className={styles.projectImageWrap}>
                  <ProjectCardImage
                    src={proj.image}
                    alt={proj.title}
                  />
                </div>

                {/* Card Body */}
                <div className={styles.projectBody}>
                  <div className={styles.projectMetaRow}>
                    <div className={styles.metaBadges}>
                      {proj.featured && (
                        <span className={styles.featuredBadge}>Featured</span>
                      )}
                      <span className={styles.projectCategory}>{proj.category || 'Engineering'}</span>
                    </div>
                  </div>

                  <h3 className={styles.projectTitle}>{proj.title}</h3>
                  <p className={styles.projectDesc}>{proj.desc}</p>

                  {Array.isArray(proj.features) && proj.features.length > 0 && (
                    <ul className={styles.highlightsList}>
                      {proj.features.slice(0, 3).map((feat, fIdx) => (
                        <li key={fIdx} className={styles.highlightItem}>
                          <span className={styles.highlightDot} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className={styles.techPills}>
                    {(proj.tech || []).map((t, tIdx) => (
                      <span key={tIdx} className={styles.techPill}>
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className={styles.projectFooter}>
                    <a
                      href={proj.previewUrl || proj.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.visitBtn}
                      id={`preview-link-${proj.id || idx}`}
                    >
                      <span>Live Preview</span>
                      <ExternalLink size={12} />
                    </a>

                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.codeBtn}
                        id={`github-link-${proj.id || idx}`}
                      >
                        <FaGithub size={13} />
                        <span>Source</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* End of Showcase / Continue to next section */}
          <div className={styles.endOfShowcase}>
            <div className={styles.endOfShowcaseLine} />
            <div className={styles.endOfShowcaseContent}>
              <p className={styles.endOfShowcaseText}>
                Showing all {filteredProjects.length} featured projects &amp; industry builds
              </p>
              <button
                type="button"
                className={styles.nextSectionBtn}
                onClick={() => {
                  const scroller = document.querySelector('main')
                  if (scroller) {
                    gsap.to(scroller, {
                      scrollTop: 4 * window.innerHeight,
                      duration: 1.0,
                      ease: 'power3.inOut',
                    })
                  }
                }}
              >
                <span>Continue to Core Services</span>
                <ArrowDown size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
