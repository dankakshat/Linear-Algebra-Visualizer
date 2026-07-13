import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../components/shared/GlassCard'
import { SectionHeader } from '../components/shared/SectionHeader'
import { SpanVisualizer2D } from '../components/section4/SpanVisualizer2D'
import { PlaneSpan3D } from '../components/section5/PlaneSpan3D'

type PresetId = 'A' | 'B' | 'C'

const PRESETS: Record<PresetId, { label: string; blurb: string }> = {
  A: {
    label: 'Independent columns',
    blurb: 'Two columns pointing in genuinely different directions reach every point in the plane.',
  },
  B: {
    label: 'Column 2 = 2 × Column 1',
    blurb: 'When one column is a multiple of the other, they collapse onto a single line. Only vectors on that line are reachable.',
  },
  C: {
    label: 'Column 3 = Column 1 + Column 2',
    blurb: 'Three columns in 3D space, but the third adds no new direction — the span is still just a flat plane.',
  },
}

const A2D = { c1: { x: 2, y: 1 }, c2: { x: -1, y: 1.5 } }
const B2D = { c1: { x: 2, y: 1 }, c2: { x: 4, y: 2 } }
const C3D = { c1: [1.4, 0.4, -0.6] as [number, number, number], c2: [-0.5, 1.3, 0.6] as [number, number, number] }
const C3D_C3: [number, number, number] = [C3D.c1[0] + C3D.c2[0], C3D.c1[1] + C3D.c2[1], C3D.c1[2] + C3D.c2[2]]

export function Section5() {
  const [preset, setPreset] = useState<PresetId>('A')

  return (
    <section id="section-5" className="relative min-h-screen px-6 py-28 flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        <SectionHeader index="05" eyebrow="Independence" title="Do the columns add anything new?">
          A column is only useful if it points somewhere the others can't already reach. That's the whole
          idea behind linear independence.
        </SectionHeader>

        <div className="flex flex-wrap gap-2 mb-8">
          {(Object.keys(PRESETS) as PresetId[]).map((id) => (
            <button
              key={id}
              onClick={() => setPreset(id)}
              className={`text-xs font-mono px-4 py-2.5 rounded-lg border transition-colors ${
                preset === id
                  ? 'bg-white/10 border-white/25 text-white'
                  : 'bg-white/[0.02] border-white/10 text-white/50 hover:text-white/80 hover:border-white/20'
              }`}
            >
              Preset {id} — {PRESETS[id].label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={preset}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.4 }}
            >
              <GlassCard className="p-6">
                <p className="text-xs font-mono text-white/40 mb-2">PRESET {preset}</p>
                <h3 className="font-[var(--font-display)] text-xl font-semibold mb-3">{PRESETS[preset].label}</h3>
                <p className="text-white/60 text-sm mb-4">{PRESETS[preset].blurb}</p>
                <div
                  className={`rounded-xl px-4 py-3 border font-mono text-xs ${
                    preset === 'A'
                      ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-300'
                      : 'bg-violet-400/10 border-violet-400/30 text-violet-300'
                  }`}
                >
                  {preset === 'A' && 'Entire plane becomes reachable.'}
                  {preset === 'B' && 'Only vectors on this line are reachable.'}
                  {preset === 'C' && 'Only a plane is reachable, even though we\u2019re in 3D.'}
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={preset}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
            >
              <GlassCard className="p-4 aspect-square">
                {preset === 'A' && <SpanVisualizer2D c1={A2D.c1} c2={A2D.c2} />}
                {preset === 'B' && <SpanVisualizer2D c1={B2D.c1} c2={B2D.c2} />}
                {preset === 'C' && <PlaneSpan3D c1={C3D.c1} c2={C3D.c2} c3={C3D_C3} />}
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
