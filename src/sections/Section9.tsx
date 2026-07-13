import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../components/shared/GlassCard'
import { SectionHeader } from '../components/shared/SectionHeader'
import { DragNumber } from '../components/shared/DragNumber'
import { StepChain2D } from '../components/section9/StepChain2D'
import { scale2, dist2, round, type Vec2 } from '../lib/math'
import { downloadSvgAsPng } from '../lib/svgScreenshot'
import { Plus, Undo2, Redo2, Play, RotateCcw, Camera } from 'lucide-react'

type Step = { vec: Vec2; colorIdx: number; label: string }

const COLUMN_COLORS = ['#4c7dff', '#22d3ee', '#a855f7']

const DEFAULT_COLUMNS: Vec2[] = [
  { x: 2, y: -1 },
  { x: -1, y: 2 },
  { x: 1, y: 1 },
]
const DEFAULT_B: Vec2 = { x: 0, y: 3 }

export function Section9() {
  const [columns, setColumns] = useState<Vec2[]>(DEFAULT_COLUMNS)
  const [b, setB] = useState<Vec2>(DEFAULT_B)
  const [activeCol, setActiveCol] = useState(0)
  const [scale, setScale] = useState(1)

  const [steps, setSteps] = useState<Step[]>([])
  const [redoStack, setRedoStack] = useState<Step[]>([])

  const [replaying, setReplaying] = useState(false)
  const [revealCount, setRevealCount] = useState<number | null>(null) // null = show all (not replaying)

  const svgRef = useRef<SVGSVGElement>(null)

  const addStep = useCallback(() => {
    const col = columns[activeCol]
    const vec = scale2(col, scale)
    setSteps((prev) => [...prev, { vec, colorIdx: activeCol, label: `${round(scale, 2)}·c${activeCol + 1}` }])
    setRedoStack([])
    setRevealCount(null)
  }, [columns, activeCol, scale])

  const undo = useCallback(() => {
    setSteps((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      setRedoStack((r) => [...r, last])
      return prev.slice(0, -1)
    })
    setRevealCount(null)
  }, [])

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      setSteps((s) => [...s, last])
      return prev.slice(0, -1)
    })
    setRevealCount(null)
  }, [])

  const clearAll = useCallback(() => {
    setSteps([])
    setRedoStack([])
    setRevealCount(null)
  }, [])

  const replay = useCallback(() => {
    if (steps.length === 0) return
    setReplaying(true)
    setRevealCount(0)
  }, [steps.length])

  useEffect(() => {
    if (!replaying || revealCount === null) return
    if (revealCount >= steps.length) {
      setReplaying(false)
      setRevealCount(null)
      return
    }
    const t = setTimeout(() => setRevealCount((c) => (c === null ? null : c + 1)), 650)
    return () => clearTimeout(t)
  }, [replaying, revealCount, steps.length])

  const visibleSteps = revealCount === null ? steps : steps.slice(0, revealCount)

  const result = useMemo(
    () => visibleSteps.reduce((acc, s) => ({ x: acc.x + s.vec.x, y: acc.y + s.vec.y }), { x: 0, y: 0 }),
    [visibleSteps],
  )
  const distance = dist2(result, b)
  const isMatch = steps.length > 0 && revealCount === null && distance < 0.15

  const screenshot = () => {
    if (svgRef.current) downloadSvgAsPng(svgRef.current, 'linear-combination.png')
  }

  return (
    <section id="section-9" className="relative min-h-screen px-6 py-28 flex items-center">
      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
        <div>
          <SectionHeader index="09" eyebrow="Linear Combination Builder" title="Build the sum, one step at a time.">
            Pick a column, choose how far to scale it, and add it to the chain. Every step is recorded — undo,
            redo, or replay the whole sequence to watch the combination assemble itself.
          </SectionHeader>

          <GlassCard className="p-6 space-y-5">
            <div>
              <p className="text-xs font-mono text-white/40 mb-2">COLUMNS</p>
              <div className="inline-flex items-start gap-3 font-mono flex-wrap">
                {columns.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-2xl text-white/20 leading-none">[</span>
                    <div className="flex flex-col gap-0.5">
                      <DragNumber
                        value={c.x}
                        onChange={(v) => setColumns((prev) => prev.map((p, idx) => (idx === i ? { ...p, x: v } : p)))}
                        color={i === 0 ? 'blue' : i === 1 ? 'cyan' : 'violet'}
                        className="text-sm"
                      />
                      <DragNumber
                        value={c.y}
                        onChange={(v) => setColumns((prev) => prev.map((p, idx) => (idx === i ? { ...p, y: v } : p)))}
                        color={i === 0 ? 'blue' : i === 1 ? 'cyan' : 'violet'}
                        className="text-sm"
                      />
                    </div>
                    <span className="text-2xl text-white/20 leading-none">]</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-mono text-white/40 mb-2">TARGET b</p>
              <div className="inline-flex items-start gap-3 font-mono">
                <span className="text-2xl text-white/20 leading-none">[</span>
                <div className="flex flex-col gap-0.5">
                  <DragNumber value={b.x} onChange={(v) => setB((p) => ({ ...p, x: v }))} color="ghost" className="text-sm" />
                  <DragNumber value={b.y} onChange={(v) => setB((p) => ({ ...p, y: v }))} color="ghost" className="text-sm" />
                </div>
                <span className="text-2xl text-white/20 leading-none">]</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {columns.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCol(i)}
                  className={`px-3 py-2 rounded-lg text-xs font-mono border transition-colors ${
                    activeCol === i
                      ? 'bg-white/15 border-white/30 text-white'
                      : 'bg-white/[0.02] border-white/10 text-white/40 hover:text-white/70'
                  }`}
                  style={activeCol === i ? { color: COLUMN_COLORS[i] } : undefined}
                >
                  c{i + 1}
                </button>
              ))}
              <div className="flex-1 flex items-center gap-2 pl-2">
                <span className="text-[10px] font-mono text-white/40">SCALE</span>
                <input
                  type="range"
                  min={-3}
                  max={3}
                  step={0.1}
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-[#4c7dff]"
                />
                <span className="text-xs font-mono text-white/60 w-10 text-right">{scale.toFixed(1)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={addStep}
                className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-lg bg-gradient-to-r from-[#7fa8ff] to-[#c081ff] text-black font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add step
              </button>
              <button
                onClick={undo}
                disabled={steps.length === 0}
                className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30"
              >
                <Undo2 className="w-3.5 h-3.5" /> Undo
              </button>
              <button
                onClick={redo}
                disabled={redoStack.length === 0}
                className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30"
              >
                <Redo2 className="w-3.5 h-3.5" /> Redo
              </button>
              <button
                onClick={replay}
                disabled={steps.length === 0 || replaying}
                className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30"
              >
                <Play className="w-3.5 h-3.5" /> Replay
              </button>
              <button
                onClick={clearAll}
                disabled={steps.length === 0}
                className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </button>
              <button
                onClick={screenshot}
                className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" /> Screenshot
              </button>
            </div>

            {steps.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {steps.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-xs font-mono text-white/60"
                  >
                    <span className="w-4 h-4 rounded-full shrink-0" style={{ background: COLUMN_COLORS[s.colorIdx] }} />
                    Step {i + 1}: add {s.label} → ({round(s.vec.x, 2)}, {round(s.vec.y, 2)})
                  </motion.div>
                ))}
              </div>
            )}

            <div
              className={`rounded-xl px-4 py-3 border font-mono text-xs ${
                isMatch
                  ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-white/50'
              }`}
            >
              {steps.length === 0
                ? 'Add your first step to start the chain.'
                : isMatch
                  ? '✓ Correct — the chain lands exactly on b.'
                  : `current sum: (${round(result.x, 2)}, ${round(result.y, 2)}) · distance from b: ${distance.toFixed(2)}`}
            </div>
          </GlassCard>
        </div>

        <GlassCard className="p-4 aspect-square">
          <AnimatePresence mode="wait">
            <motion.div
              key={replaying ? 'replay' : 'static'}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              className="w-full h-full"
            >
              <StepChain2D svgRef={svgRef} steps={visibleSteps} b={b} />
            </motion.div>
          </AnimatePresence>
        </GlassCard>
      </div>
    </section>
  )
}
