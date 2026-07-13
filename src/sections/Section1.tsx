import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../components/shared/GlassCard'
import { DragNumber } from '../components/shared/DragNumber'
import { VectorField2D } from '../components/section1/VectorField2D'
import { applyColumns2, dist2, solve2x2, round, clamp } from '../lib/math'
import { Check, X, Shuffle, RotateCcw } from 'lucide-react'

const DEFAULT_A = { c1: { x: 2, y: -1 }, c2: { x: -1, y: 2 } }
const DEFAULT_B = { x: 0, y: 3 }

export function Section1() {
  const [c1, setC1] = useState(DEFAULT_A.c1)
  const [c2, setC2] = useState(DEFAULT_A.c2)
  const [b, setB] = useState(DEFAULT_B)
  const [x, setX] = useState(1)
  const [y, setY] = useState(1)

  const result = useMemo(() => applyColumns2(c1, c2, x, y), [c1, c2, x, y])
  const distance = useMemo(() => dist2(result, b), [result, b])
  const isMatch = distance < 0.12

  const handleDragResult = (pt: { x: number; y: number }) => {
    const sol = solve2x2(c1, c2, pt)
    if (!sol) return
    setX(clamp(round(sol.x, 2), -5, 5))
    setY(clamp(round(sol.y, 2), -5, 5))
  }

  const randomize = () => {
    const r = () => Math.round((Math.random() * 8 - 4) * 10) / 10
    setC1({ x: r(), y: r() })
    setC2({ x: r(), y: r() })
    setB({ x: r(), y: r() })
  }

  const reset = () => {
    setC1(DEFAULT_A.c1)
    setC2(DEFAULT_A.c2)
    setB(DEFAULT_B)
    setX(1)
    setY(1)
  }

  return (
    <section id="section-1" className="relative min-h-screen px-6 py-28 flex items-center">
      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
        {/* left: explanation + controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs tracking-[0.3em] text-white/40 uppercase mb-3">01 — Column Picture</p>
          <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-semibold mb-4">
            Columns are directions.
          </h2>
          <p className="text-white/60 mb-8 max-w-md">
            Ax = x·c<sub>1</sub> + y·c<sub>2</sub>. Scaling changes how far you move down each
            column; adding combines the two movements. Solving Ax = b is asking:{' '}
            <em className="text-white/80 not-italic">how far down each direction do I need to
            walk to land exactly on b?</em>
          </p>

          <GlassCard className="p-6 mb-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs font-mono text-white/40 mb-2">MATRIX A (columns)</p>
                <div className="flex items-center gap-2 font-mono text-lg">
                  <span className="text-white/30">[</span>
                  <div className="flex flex-col items-center">
                    <DragNumber value={c1.x} onChange={(v) => setC1({ ...c1, x: v })} color="blue" />
                    <DragNumber value={c2.x} onChange={(v) => setC2({ ...c2, x: v })} color="cyan" />
                  </div>
                  <div className="flex flex-col items-center">
                    <DragNumber value={c1.y} onChange={(v) => setC1({ ...c1, y: v })} color="blue" />
                    <DragNumber value={c2.y} onChange={(v) => setC2({ ...c2, y: v })} color="cyan" />
                  </div>
                  <span className="text-white/30">]</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-mono text-white/40 mb-2">TARGET b</p>
                <div className="flex items-center gap-2 font-mono text-lg">
                  <span className="text-white/30">[</span>
                  <div className="flex flex-col items-center">
                    <DragNumber value={b.x} onChange={(v) => setB({ ...b, x: v })} color="ghost" />
                    <DragNumber value={b.y} onChange={(v) => setB({ ...b, y: v })} color="ghost" />
                  </div>
                  <span className="text-white/30">]</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-[#7fa8ff]">x</span>
                  <DragNumber value={x} onChange={setX} min={-5} max={5} color="blue" />
                </div>
                <input
                  type="range"
                  min={-5}
                  max={5}
                  step={0.05}
                  value={x}
                  onChange={(e) => setX(parseFloat(e.target.value))}
                  className="w-full accent-[#4c7dff]"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-[#22d3ee]">y</span>
                  <DragNumber value={y} onChange={setY} min={-5} max={5} color="cyan" />
                </div>
                <input
                  type="range"
                  min={-5}
                  max={5}
                  step={0.05}
                  value={y}
                  onChange={(e) => setY(parseFloat(e.target.value))}
                  className="w-full accent-[#22d3ee]"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={randomize}
                className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Shuffle className="w-3.5 h-3.5" /> Random
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </GlassCard>

          <motion.div
            key={isMatch ? 'match' : 'nomatch'}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
              isMatch
                ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300'
                : 'bg-rose-400/10 border-rose-400/30 text-rose-300'
            }`}
          >
            {isMatch ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <div className="font-mono text-sm">
              {isMatch ? (
                'Correct solution — Ax = b'
              ) : (
                <>distance from b: {round(distance, 2)}</>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* right: visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GlassCard className="p-4 aspect-square">
            <VectorField2D
              c1={c1}
              c2={c2}
              x={x}
              y={y}
              b={b}
              isMatch={isMatch}
              onDragResult={handleDragResult}
            />
          </GlassCard>
          <p className="text-center text-xs text-white/35 font-mono mt-3">
            drag the solid dot to solve by hand — x and y update live
          </p>
        </motion.div>
      </div>
    </section>
  )
}
