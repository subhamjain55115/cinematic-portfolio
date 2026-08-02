'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue } from 'motion/react'
import { FiX } from 'react-icons/fi'
import { cn } from '@/lib/utils'

// Ported from a 21st.dev community component (originally TSX, using
// framer-motion + lucide-react) into this project's JS setup:
// - `framer-motion` -> `motion/react` (same API, already a dependency
//   from CertificationsSection's earlier gallery - avoids a second,
//   duplicate animation library).
// - `lucide-react` X icon -> `react-icons/fi`'s FiX, since react-icons
//   is already used everywhere else in this project for icons.
// - shadcn semantic tokens (bg-background, text-foreground, bg-card...)
//   -> concrete dark-theme values, since this project's tokens map
//   bg-background to white (see app/globals.css) and this gallery is
//   embedded inside an always-dark section.
// - Dropped the built-in title/description header and scroll-fade -
//   the parent section already renders its own header.
// - Pans on mouse/touch drag AND horizontal wheel/trackpad input, but
//   only when the gesture is horizontal (deltaX-dominant, or Shift+wheel).
//   A plain vertical wheel/touch scroll is left completely alone so it
//   still bubbles to page.js's global section-snap navigation - an
//   earlier version intercepted all wheel input and trapped the page
//   inside this section.

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
}

const ImageModal = ({ item, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.url}
          alt={item.title}
          className="h-auto max-h-[90vh] w-full rounded-lg object-contain"
        />
      </motion.div>
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-white/80 transition-colors hover:text-white"
        aria-label="Close image view"
      >
        <FiX size={24} />
      </button>
    </motion.div>
  )
}

export default function BentoGallery({ items }) {
  const [selectedItem, setSelectedItem] = useState(null)
  const [dragConstraint, setDragConstraint] = useState(0)
  const containerRef = useRef(null)
  const gridRef = useRef(null)
  const x = useMotionValue(0)

  useEffect(() => {
    const calculateConstraints = () => {
      if (gridRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const gridWidth = gridRef.current.scrollWidth
        const newConstraint = Math.min(0, containerWidth - gridWidth - 32)
        setDragConstraint(newConstraint)
      }
    }

    calculateConstraints()
    window.addEventListener('resize', calculateConstraints)
    return () => window.removeEventListener('resize', calculateConstraints)
  }, [items])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function handleWheel(event) {
      const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      if (!horizontalIntent && !event.shiftKey) return // vertical scroll - let it bubble to the page

      event.preventDefault()
      event.stopPropagation()
      const delta = horizontalIntent ? event.deltaX : event.deltaY
      const next = Math.min(0, Math.max(dragConstraint, x.get() - delta))
      x.set(next)
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [dragConstraint, x])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={containerRef}
        className="relative flex h-full w-full cursor-grab active:cursor-grabbing"
      >
        <motion.div
          className="h-full w-max"
          drag="x"
          style={{ x }}
          dragConstraints={{ left: dragConstraint, right: 0 }}
          dragElastic={0.05}
        >
          <motion.div
            ref={gridRef}
            className="grid h-full auto-cols-[minmax(13rem,1fr)] auto-rows-fr grid-flow-col gap-4 px-4 md:px-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {items.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className={cn(
                  'group relative flex h-full w-full min-w-48 cursor-pointer items-end overflow-hidden rounded-xl border border-white/10 bg-[#111] p-4 shadow-sm transition-shadow duration-300 ease-in-out hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]',
                  item.span,
                )}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => setSelectedItem(item)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedItem(item)}
                tabIndex={0}
                aria-label={`View ${item.title}`}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <ImageModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
