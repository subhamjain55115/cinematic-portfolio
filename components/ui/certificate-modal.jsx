'use client'

import { motion, AnimatePresence } from 'motion/react'
import { FiX } from 'react-icons/fi'

// Extracted from the earlier bento-gallery.jsx (now removed) so the
// Certifications marquee can reuse the same lightbox pattern: dark
// backdrop-blur, object-contain image capped at 85vh so both landscape
// and portrait certificates are always fully visible, no cropping.
export default function CertificateModal({ item, onClose }) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative flex max-w-3xl flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={item.image}
              alt={`${item.title} certificate from ${item.issuer}`}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl md:max-w-2xl"
            />
            <div className="text-center">
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-white/60">
                {item.issuer} &middot; {item.year}
              </p>
            </div>
          </motion.div>

          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-white/80 transition-colors hover:text-white"
            aria-label="Close certificate view"
          >
            <FiX size={26} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
