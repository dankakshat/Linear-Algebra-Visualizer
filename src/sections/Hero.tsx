import { motion } from 'framer-motion'
import { FloatingVectors } from '../components/hero/FloatingVectors'
import { ArrowDown } from 'lucide-react'

export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6"
    >
      <FloatingVectors />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 40%, rgba(76,125,255,0.10), transparent 70%), radial-gradient(40% 40% at 80% 70%, rgba(168,85,247,0.08), transparent 70%)',
        }}
      />

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 font-mono text-xs tracking-[0.3em] text-white/45 uppercase mb-6"
      >
        MIT 18.06 · Column Picture
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="relative z-10 font-[var(--font-display)] text-center text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight max-w-4xl leading-[1.05]"
      >
        The Geometry of<br />
        <span className="text-gradient">Linear Equations</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.22 }}
        className="relative z-10 mt-6 text-center text-lg sm:text-xl text-white/60 max-w-xl"
      >
        Every matrix is a set of directions. Solving Ax = b means finding
        exactly how far to walk down each one.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.34 }}
        className="relative z-10 mt-10"
      >
        <a
          href="#section-1"
          className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-medium text-black bg-gradient-to-r from-[#7fa8ff] via-[#22d3ee] to-[#c081ff] shadow-[0_0_40px_-8px_rgba(76,125,255,0.6)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          Start Exploring
          <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 flex flex-col items-center gap-2 text-white/30"
      >
        <span className="text-[10px] font-mono tracking-widest">SCROLL</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  )
}
