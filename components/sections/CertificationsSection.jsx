'use client'

import { useState } from 'react'
import profile from '@/data/profile.json'
import { usePortfolio } from '@/context/PortfolioContext'
import MarqueeColumn from '@/components/ui/marquee-column'
import CertificateModal from '@/components/ui/certificate-modal'
import styles from '@/styles/sections/CertificationsSection.module.css'

export default function CertificationsSection() {
  const { certifications: contextCerts } = usePortfolio()
  const certs = (contextCerts?.length ? contextCerts : profile.certifications).slice().sort(
    (a, b) => new Date(b.date || '2020-01-01') - new Date(a.date || '2020-01-01')
  )

  // Split alternately so both columns carry a similar mix of recent/older certs
  const columnA = certs.filter((_, i) => i % 2 === 0)
  const columnB = certs.filter((_, i) => i % 2 === 1)
  const [selected, setSelected] = useState(null)

  return (
    <section className={styles.section}>

      <div className={styles.contentGrid}>

        <MarqueeColumn items={columnA.length ? columnA : certs} direction="down" duration={46} onSelect={setSelected} />

        <div className={styles.centerPanel}>
          <div className={styles.panelPhotoGlow}>
            <div className={styles.panelPhotoWrap}>
              <img
                src="/assets/subham-about3.png"
                alt={profile.name.full}
                className={styles.panelPhoto}
              />
            </div>
          </div>

          <p className={styles.panelLabel}>Certifications</p>
          <h2 className={styles.panelHeading}>Continuous Learning</h2>
          <p className={styles.panelSub}>
            Continuous learning across AI, engineering &amp; soft skills.
          </p>

          <div className={styles.panelStat}>
            <span className={styles.panelStatValue}>{certs.length}</span>
            <span className={styles.panelStatLabel}>Credentials</span>
          </div>
        </div>

        <MarqueeColumn items={columnB.length ? columnB : certs} direction="up" duration={38} onSelect={setSelected} />

      </div>

      <CertificateModal item={selected} onClose={() => setSelected(null)} />

    </section>
  )
}
