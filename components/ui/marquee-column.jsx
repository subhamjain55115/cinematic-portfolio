'use client'

import { useState } from 'react'
import styles from '@/styles/sections/CertificationsSection.module.css'

// Deterministic pseudo-random tilt so every card gets an irregular but
// stable rotation (-6deg..+6deg) - not re-randomized on re-render, and
// not an obvious alternating pattern.
function seededTilt(seed) {
  const x = Math.sin(seed * 9973) * 10000
  const frac = x - Math.floor(x)
  return +(frac * 12 - 6).toFixed(2)
}

export default function MarqueeColumn({ items, direction, duration, onSelect }) {
  const [paused, setPaused] = useState(false)
  // Duplicated back-to-back so translateY(-50%) loops with no visible seam.
  const looped = [...items, ...items]

  return (
    <div className={styles.marqueeViewport}>
      <div
        className={styles.marqueeTrack}
        style={{
          animationDirection: direction === 'down' ? 'reverse' : 'normal',
          animationDuration: `${duration}s`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {looped.map((cert, i) => (
          <button
            key={`${cert.id}-${i}`}
            type="button"
            className={styles.card}
            style={{ '--tilt': `${seededTilt(cert.id + i * 7)}deg` }}
            onClick={() => onSelect(cert)}
            aria-label={`View ${cert.title} certificate`}
          >
            <img
              src={cert.image}
              alt={`${cert.title} certificate from ${cert.issuer}`}
              className={styles.cardImg}
              draggable={false}
            />
            <span className={styles.cardOverlay} aria-hidden />
            <span className={styles.cardText}>
              <span className={styles.cardTitle}>{cert.title}</span>
              <span className={styles.cardMeta}>{cert.issuer} &middot; {cert.year}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
