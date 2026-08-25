'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Image from 'next/image'
import {
  Globe,
  Layers,
  Smartphone,
  Bot,
  Palette,
  Cpu,
  Code,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  ArrowUpRight,
  Briefcase,
  LayoutGrid,
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
  const { services: liveServices, templates: liveTemplates } = usePortfolio()
  const [activeTab, setActiveTab] = useState('services') // 'services' | 'templates'
  const [selectedCategory, setSelectedCategory] = useState('All')

  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const contentRef = useRef(null)

  const services = useMemo(() => {
    return liveServices && liveServices.length > 0 ? liveServices : profileData.services || []
  }, [liveServices])

  const templates = useMemo(() => {
    return liveTemplates && liveTemplates.length > 0 ? liveTemplates : profileData.templates || []
  }, [liveTemplates])

  // Extract distinct template categories
  const categories = useMemo(() => {
    const set = new Set(['All'])
    templates.forEach((t) => {
      if (t.category) set.add(t.category)
    })
    return Array.from(set)
  }, [templates])

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'All') return templates
    return templates.filter((t) => t.category?.toLowerCase() === selectedCategory.toLowerCase())
  }, [templates, selectedCategory])

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
          <span className={styles.label}>Expertise & Ready Builds</span>
          <h2 className={styles.title}>
            Services <span className={styles.titleMuted}>&amp; Templates</span>
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className={styles.navControls} role="tablist">
          <button
            id="tab-btn-services"
            type="button"
            role="tab"
            aria-selected={activeTab === 'services'}
            className={`${styles.tabBtn} ${activeTab === 'services' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <Briefcase size={14} />
            <span>Core Services</span>
            <span className={styles.badge}>{services.length}</span>
          </button>

          <button
            id="tab-btn-templates"
            type="button"
            role="tab"
            aria-selected={activeTab === 'templates'}
            className={`${styles.tabBtn} ${activeTab === 'templates' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <LayoutGrid size={14} />
            <span>Template Projects</span>
            <span className={styles.badge}>{templates.length}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div ref={contentRef} className={styles.container}>
        {activeTab === 'services' ? (
          /* Services View */
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
                      <span>Inquire</span>
                      <ArrowUpRight size={13} />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Templates View */
          <div id="templates-grid-view">
            {/* Category Filter */}
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

            {/* Template Projects Grid */}
            <div className={styles.templatesGrid}>
              {filteredTemplates.map((item, idx) => (
                <div
                  key={item.id || idx}
                  id={`template-card-${item.id || idx}`}
                  className={styles.templateCard}
                >
                  {/* Browser Mockup Bar */}
                  <div className={styles.browserHeader}>
                    <div className={styles.browserDots}>
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                    </div>
                    <span className={styles.browserUrl}>
                      {item.siteName || item.link?.replace(/^https?:\/\//, '') || 'live-demo.app'}
                    </span>
                    <div className={styles.liveTag}>
                      <span className={styles.livePulse} />
                      <span>Live App</span>
                    </div>
                  </div>

                  {/* Hero Screenshot Frame */}
                  <div className={styles.templateImageWrap}>
                    <Image
                      src={item.image || '/assets/projects/crypto-tracker.png'}
                      alt={item.title}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className={styles.templateImg}
                    />
                  </div>

                  {/* Body Info */}
                  <div className={styles.templateBody}>
                    <div className={styles.templateMetaRow}>
                      <span className={styles.templateCategory}>{item.category}</span>
                      <span className={styles.siteName}>{item.siteName}</span>
                    </div>

                    <h3 className={styles.templateTitle}>{item.title}</h3>
                    <p className={styles.templateDesc}>{item.desc}</p>

                    <div className={styles.templateFooter}>
                      <div className={styles.techPills}>
                        {(item.tech || []).slice(0, 3).map((t, tIdx) => (
                          <span key={tIdx} className={styles.techPill}>
                            {t}
                          </span>
                        ))}
                      </div>

                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.visitBtn}
                          id={`visit-template-btn-${item.id || idx}`}
                        >
                          <span>Visit Live</span>
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
