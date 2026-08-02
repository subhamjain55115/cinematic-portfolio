'use client'

import { FaWhatsapp } from 'react-icons/fa6'
import profile from '@/data/profile.json'
import styles from '@/styles/ui/WhatsAppButton.module.css'

const WHATSAPP = profile.socials.find((s) => s.label === 'WhatsApp')

export default function WhatsAppButton() {
  if (!WHATSAPP) return null

  return (
    <a
      href={WHATSAPP.href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
      aria-label="Chat on WhatsApp"
    >
      <span className={styles.pulse} aria-hidden />
      <FaWhatsapp size={26} />
    </a>
  )
}
