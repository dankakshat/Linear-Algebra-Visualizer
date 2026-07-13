import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../components/shared/GlassCard'
import { SectionHeader } from '../components/shared/SectionHeader'
import { DragNumber } from '../components/shared/DragNumber'
import { SpanVisualizer2D } from '../components/section4/SpanVisualizer2D'
import { det2 } from '../lib/math'

export function Section4() {
  const [c1, setC1] = useState({ x: 2, y: 1 })
  const [c2, setC2] = useState({ x: -1, y: 1.5 })

  const det = det2(c1, c2)
  const isFull = Math.abs(det) > 0.15
  const isZero = Math.hypot(c1.x, c1.y) < 0.05 && Math.hypot(c2.x, c2.y) < 0.05

  const message = isZero
    ? 'Both columns are zero — nothing is reachable but the origin.'
    : isFull
      ? 'This matrix spans the entire space.'
      : 'This matrix only spans a line.'

  return (
    <section id="section-4" className="relative min-h-screen px-6 py-28 flex items-center">
      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
        <div>
          <SectionHeader index="04" eyebrow="Span Explorer" title="What can these columns create?">
            Every combination x·c1 + y·c2, for every possible x and y, sweeps out the{' '}
            <em className="text-white/80 not-italic">span</em> of the columns. Drag the entries below and watch
            how much of the plane becomes reachable.
          </SectionHeader>

          <GlassCard className="p-6">
            <p className="text-xs font-mono text-white/40 mb-3">EDIT THE COLUMNS</p>
            <div className="grid grid-cols-2 gap-8 font-mono text-lg mb-6">
              <div>
                <p className="text-xs text-[#7fa8ff] mb-2">c1</p>
                <div className="flex gap-2">
                  <DragNumber value={c1.x} onChange={(v) => setC1({ ...c1, x: v })} color="blue" />
                  <DragNumber value={c1.y} onChange={(v) => setC1({ ...c1, y: v })} color="blue" />
                </div>
              </div>
              <div>
                <p className="text-xs text-[#22d3ee] mb-2">c2</p>
                <div className="flex gap-2">
                  <DragNumber value={c2.x} onChange={(v) => setC2({ ...c2, x: v })} color="cyan" />
                  <DragNumber value={c2.y} onChange={(v) => setC2({ ...c2, y: v })} color="cyan" />
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={message}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl px-4 py-3 border font-mono text-sm ${
                  isFull ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-300' : 'bg-violet-400/10 border-violet-400/30 text-violet-300'
                }`}
              >
                {message}
              </motion.div>
            </AnimatePresence>

            <button
              onClick={() => { setC1({ x: 2, y: 1 }); setC2({ x: 4, y: 2 }) }}
              className="mt-4 text-xs font-mono px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              Try a collapsed example →
            </button>
          </GlassCard>
        </div>

        <GlassCard className="p-4 aspect-square">
          <SpanVisualizer2D c1={c1} c2={c2} />
        </GlassCard>
      </div>
    </section>
  )
}
