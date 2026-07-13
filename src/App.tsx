import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Hero } from './sections/Hero'
import { Section1 } from './sections/Section1'
import { Section2 } from './sections/Section2'
import { Section3 } from './sections/Section3'
import { Section4 } from './sections/Section4'
import { Section5 } from './sections/Section5'
import { Section6 } from './sections/Section6'
import { Section7 } from './sections/Section7'
import { Section8 } from './sections/Section8'
import { Section9 } from './sections/Section9'
import { Section10 } from './sections/Section10'
import { SectionDots } from './components/shared/SectionDots'
import { FloatingToolbar } from './components/shared/FloatingToolbar'
import { loadProgress, saveProgress } from './lib/types'

const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'section-1', label: '2D Column Picture' },
  { id: 'section-2', label: 'Row vs Column' },
  { id: 'section-3', label: '3D Column Picture' },
  { id: 'section-4', label: 'Span Explorer' },
  { id: 'section-5', label: 'Independence' },
  { id: 'section-6', label: 'Dimension Explorer' },
  { id: 'section-7', label: 'Reachability' },
  { id: 'section-8', label: 'Matrix Playground' },
  { id: 'section-9', label: 'Combination Builder' },
  { id: 'section-10', label: 'Learning Mode' },
]

export default function App() {
  const [active, setActive] = useState('hero')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
            const p = loadProgress()
            if (!p.visitedSections.includes(entry.target.id)) {
              saveProgress({ ...p, visitedSections: [...p.visitedSections, entry.target.id] })
            }
          }
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative">
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#090909]"
          >
            <motion.div
              className="w-10 h-10 rounded-full border-2 border-white/15 border-t-[#7fa8ff]"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingToolbar />
      <SectionDots sections={SECTIONS} active={active} />
      <Hero />
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <Section6 />
      <Section7 />
      <Section8 />
      <Section9 />
      <Section10 />
    </div>
  )
}
