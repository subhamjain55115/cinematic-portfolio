'use client'

import { useState } from 'react'
import profile from '@/data/profile.json'
import MarqueeColumn from '@/components/ui/marquee-column'
import CertificateModal from '@/components/ui/certificate-modal'
import styles from '@/styles/sections/CertificationsSection.module.css'

// Most recent first
const CERTS = [...profile.certifications].sort(
  (a, b) => new Date(b.date) - new Date(a.date),
)

// Split alternately so both columns carry a similar mix of recent/older certs
const COLUMN_A = CERTS.filter((_, i) => i % 2 === 0)
const COLUMN_B = CERTS.filter((_, i) => i % 2 === 1)

export default function CertificationsSection() {
  const [selected, setSelected] = useState(null)

  return (
    <section className={styles.section}>

      <div className={styles.contentGrid}>

        <MarqueeColumn items={COLUMN_A} direction="down" duration={46} onSelect={setSelected} />

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
            <span className={styles.panelStatValue}>{CERTS.length}</span>
            <span className={styles.panelStatLabel}>Credentials</span>
          </div>
        </div>

        <MarqueeColumn items={COLUMN_B} direction="up" duration={38} onSelect={setSelected} />

      </div>

      <CertificateModal item={selected} onClose={() => setSelected(null)} />

    </section>
  )
}
