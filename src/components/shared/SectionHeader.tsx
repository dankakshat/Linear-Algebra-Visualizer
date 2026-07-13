import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function SectionHeader({
  index,
  eyebrow,
  title,
  children,
}: {
  index: string
  eyebrow: string
  title: ReactNode
  children?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
    >
      <p className="font-mono text-xs tracking-[0.3em] text-white/40 uppercase mb-3">
        {index} — {eyebrow}
      </p>
      <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-semibold mb-4">{title}</h2>
      {children && <p className="text-white/60 mb-8 max-w-xl">{children}</p>}
    </motion.div>
  )
}
