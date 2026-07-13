import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../components/shared/GlassCard'
import { SectionHeader } from '../components/shared/SectionHeader'
import { VectorField2D } from '../components/section1/VectorField2D'
import { Scene3D } from '../components/section3/Scene3D'
import { AbstractDimensionView } from '../components/section6/AbstractDimensionView'
import { vecDist } from '../lib/linalg'
import { X } from 'lucide-react'

// Deterministic pseudo-random generator so each dimension count always
// produces the same columns/target (stable across re-renders / re-visits).
function seededVec(seed: number, dims: number, scale = 2.2): number[] {
  const out: number[] = []
  let s = seed
  for (let i = 0; i < dims; i++) {
    s = (s * 9301 + 49297) % 233280
    out.push(((s / 233280) * 2 - 1) * scale)
  }
  return out
}

export function Section6() {
  const [dims, setDims] = useState(3)
  const [x, setX] = useState(0.8)
  const [y, setY] = useState(0.6)
  const [showExplainer, setShowExplainer] = useState(false)

  const c1 = useMemo(() => seededVec(dims * 17 + 3, dims), [dims])
  const c2 = useMemo(() => seededVec(dims * 31 + 11, dims), [dims])
  const b = useMemo(() => seededVec(dims * 53 + 7, dims, 1.6), [dims])

  const combined = useMemo(() => c1.map((v, i) => v * x + c2[i] * y), [c1, c2, x, y])
  const distance = vecDist(combined, b)
  const isMatch = distance < 0.25

  const dimLabel = dims === 2 ? 'a plane' : dims === 3 ? 'space' : `${dims}-dimensional space`

  return (
    <section id="section-6" className="relative min-h-screen px-6 py-28 flex items-center">
      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
        <div>
          <SectionHeader index="06" eyebrow="Dimension Explorer" title="Every dimension, same idea.">
            The mechanics of Ax = x·c1 + y·c2 never change — only how many numbers each vector holds.
            Two columns, two knobs, one target — whether you're in a plane or in {dims === 9 ? 'nine dimensions' : `${dims} dimensions`}.
          </SectionHeader>

          <GlassCard className="p-6 space-y-6">
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-white/50">DIMENSIONS</span>
                <span className="text-white">{dims}D</span>
              </div>
              <input
                type="range" min={2} max={9} step={1} value={dims}
                onChange={(e) => setDims(parseInt(e.target.value))}
                className="w-full accent-[#a855f7]"
              />
              <div className="flex justify-between text-[10px] font-mono text-white/30 mt-1">
                {Array.from({ length: 8 }, (_, i) => (
                  <span key={i}>{i + 2}</span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-[#7fa8ff]">x</span>
                  <span className="text-white/50">{x.toFixed(2)}</span>
                </div>
                <input type="range" min={-2} max={2} step={0.02} value={x} onChange={(e) => setX(parseFloat(e.target.value))} className="w-full accent-[#4c7dff]" />
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-[#22d3ee]">y</span>
                  <span className="text-white/50">{y.toFixed(2)}</span>
                </div>
                <input type="range" min={-2} max={2} step={0.02} value={y} onChange={(e) => setY(parseFloat(e.target.value))} className="w-full accent-[#22d3ee]" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={dims}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-mono text-xs text-white/50"
              >
                {dims <= 3
                  ? `You are looking at ${dimLabel} directly.`
                  : `You are now working in ${dims}-dimensional space.`}
              </motion.p>
            </AnimatePresence>

            <div
              className={`rounded-xl px-4 py-3 border font-mono text-xs ${
                isMatch ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300' : 'bg-white/5 border-white/10 text-white/50'
              }`}
            >
              {isMatch ? 'Reached b in this space.' : `distance from b: ${distance.toFixed(2)}`}
            </div>

            {dims >= 4 && (
              <button
                onClick={() => setShowExplainer(true)}
                className="text-xs font-mono px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors w-full text-left"
              >
                What does this actually mean? →
              </button>
            )}
          </GlassCard>
        </div>

        <GlassCard className="p-4 aspect-square">
          <AnimatePresence mode="wait">
            <motion.div
              key={dims <= 3 ? dims : 'abstract'}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="w-full h-full"
            >
              {dims === 2 && (
                <VectorField2D
                  c1={{ x: c1[0], y: c1[1] }}
                  c2={{ x: c2[0], y: c2[1] }}
                  x={x}
                  y={y}
                  b={{ x: b[0], y: b[1] }}
                  isMatch={isMatch}
                  onDragResult={() => {}}
                />
              )}
              {dims === 3 && (
                <Scene3D
                  c1={[c1[0], c1[1], c1[2]]}
                  c2={[c2[0], c2[1], c2[2]]}
                  c3={[0, 0, 0]}
                  x={x}
                  y={y}
                  z={0}
                  b={[b[0], b[1], b[2]]}
                  isMatch={isMatch}
                />
              )}
              {dims >= 4 && <AbstractDimensionView dims={dims} columns={[c1, c2]} b={b} weights={[x, y]} />}
            </motion.div>
          </AnimatePresence>
        </GlassCard>
      </div>

      <AnimatePresence>
        {showExplainer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
            onClick={() => setShowExplainer(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="p-8 max-w-lg">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-[var(--font-display)] text-2xl font-semibold">What does {dims}D actually mean?</h3>
                  <button onClick={() => setShowExplainer(false)} className="text-white/40 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3 text-white/65 text-sm leading-relaxed">
                  <p>Humans cannot visualize {dims}D directly, but the mathematics remains identical.</p>
                  <p>
                    A vector in {dims}D is just a list of {dims} numbers. "Adding" two of them still means adding
                    matching entries. "Scaling" still means multiplying every entry by the same number. Nothing
                    about the algebra cares how many entries there are — only our ability to draw a picture runs out.
                  </p>
                  <p>
                    The spokes in this view are a bookkeeping trick: one spoke per dimension, with each vector's
                    component on that dimension drawn as a distance along it. It isn't a "real" {dims}D picture —
                    no 2D image can be — but it lets you track the same story: two directions, scaled and summed,
                    trying to land on a target.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
