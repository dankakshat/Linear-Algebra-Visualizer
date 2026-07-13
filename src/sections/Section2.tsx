import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../components/shared/GlassCard'
import { SectionHeader } from '../components/shared/SectionHeader'
import { DragNumber } from '../components/shared/DragNumber'
import { VectorField2D } from '../components/section1/VectorField2D'
import { LinePicture2D } from '../components/section2/LinePicture2D'
import { applyColumns2, dist2 } from '../lib/math'

const A = { c1: { x: 2, y: -1 }, c2: { x: -1, y: 2 } }
const B = { x: 0, y: 3 }

export function Section2() {
  const [x, setX] = useState(1)
  const [y, setY] = useState(1)
  const [mode, setMode] = useState<'equations' | 'vectors'>('equations')

  // rows of A, read directly from the same matrix used for the column view
  const row1 = { x: A.c1.x, y: A.c2.x }
  const row2 = { x: A.c1.y, y: A.c2.y }

  const result = useMemo(() => applyColumns2(A.c1, A.c2, x, y), [x, y])
  const distance = useMemo(() => dist2(result, B), [result])
  const isMatch = distance < 0.12

  return (
    <section id="section-2" className="relative min-h-screen px-6 py-28 flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        <SectionHeader index="02" eyebrow="Two Pictures, One Answer" title="Same system. Two stories.">
          Every system of equations can be read two ways: as a set of{' '}
          <em className="text-white/80 not-italic">lines that must all agree</em>, or as a{' '}
          <em className="text-white/80 not-italic">combination of directions that must land on a target</em>. They
          always agree on the answer.
        </SectionHeader>

        <div className="flex justify-center mb-8">
          <div className="glass rounded-full p-1 flex gap-1 font-mono text-xs">
            <button
              onClick={() => setMode('equations')}
              className={`px-4 py-2 rounded-full transition-colors ${mode === 'equations' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              Think as Equations
            </button>
            <button
              onClick={() => setMode('vectors')}
              className={`px-4 py-2 rounded-full transition-colors ${mode === 'vectors' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              Think as Vector Combinations
            </button>
          </div>
        </div>

        <GlassCard className="p-6 mb-8">
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto mb-6">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-[#7fa8ff]">x</span>
                <DragNumber value={x} onChange={setX} min={-5} max={5} color="blue" />
              </div>
              <input type="range" min={-5} max={5} step={0.05} value={x} onChange={(e) => setX(parseFloat(e.target.value))} className="w-full accent-[#4c7dff]" />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-[#22d3ee]">y</span>
                <DragNumber value={y} onChange={setY} min={-5} max={5} color="cyan" />
              </div>
              <input type="range" min={-5} max={5} step={0.05} value={y} onChange={(e) => setY(parseFloat(e.target.value))} className="w-full accent-[#22d3ee]" />
            </div>
          </div>
        </GlassCard>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            animate={{ opacity: mode === 'equations' ? 1 : 0.35, scale: mode === 'equations' ? 1 : 0.97 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard className="p-4 aspect-square">
              <LinePicture2D row1={row1} row2={row2} b1={B.x} b2={B.y} point={result} isMatch={isMatch} />
            </GlassCard>
            <div className="text-center mt-3 font-mono text-xs text-white/40 space-y-0.5">
              <p><span className="text-[#4c7dff]">2x − y = 0</span></p>
              <p><span className="text-[#22d3ee]">−x + 2y = 3</span></p>
              <p className="text-white/30 mt-1">the two lines intersect at the one (x, y) that satisfies both</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: mode === 'vectors' ? 1 : 0.35, scale: mode === 'vectors' ? 1 : 0.97 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard className="p-4 aspect-square">
              <VectorField2D c1={A.c1} c2={A.c2} x={x} y={y} b={B} isMatch={isMatch} onDragResult={() => {}} />
            </GlassCard>
            <p className="text-center mt-3 font-mono text-xs text-white/30">
              the same (x, y) scales the columns to land exactly on b
            </p>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isMatch ? 'm' : 'nm'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-8 mx-auto max-w-md text-center rounded-xl px-4 py-3 border font-mono text-sm ${
              isMatch ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300' : 'bg-white/5 border-white/10 text-white/50'
            }`}
          >
            {isMatch ? 'Both views agree — this is the solution.' : `distance from intersection: ${distance.toFixed(2)}`}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
