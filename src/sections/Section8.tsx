import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../components/shared/GlassCard'
import { SectionHeader } from '../components/shared/SectionHeader'
import { DragNumber } from '../components/shared/DragNumber'
import { applyColumns, determinant, isIndependent, isReachable, rank, randomColumns, round, type Cols } from '../lib/linalg'
import { downloadJSON, readJSONFile, parseMatrixExport } from '../lib/exportImport'
import { Shuffle, RotateCcw, Download, Upload } from 'lucide-react'

function makeDefault(rows: number, cols: number): Cols {
  return Array.from({ length: cols }, (_, j) => Array.from({ length: rows }, (_, i) => (i === j ? 1 : 0)))
}

export function Section8() {
  const [size, setSize] = useState(3) // square-ish: rows = cols = size, for simplicity of editing UX
  const [cols, setCols] = useState<Cols>(() => makeDefault(3, 3))
  const [b, setB] = useState<number[]>(() => [1, 1, 1])

  const resize = (n: number) => {
    setSize(n)
    setCols((prev) =>
      Array.from({ length: n }, (_, j) => Array.from({ length: n }, (_, i) => prev[j]?.[i] ?? (i === j ? 1 : 0))),
    )
    setB((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? 0))
  }

  const setEntry = (j: number, i: number, v: number) => {
    setCols((prev) => {
      const next = prev.map((c) => [...c])
      next[j][i] = v
      return next
    })
  }

  const randomize = () => {
    setCols(randomColumns(size, size, 3))
    setB(Array.from({ length: size }, () => round((Math.random() * 2 - 1) * 3, 1)))
  }
  const reset = () => {
    setCols(makeDefault(size, size))
    setB(Array.from({ length: size }, () => 0))
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const exportMatrix = () => {
    downloadJSON('matrix.json', { version: 1, size, columns: cols, b })
  }

  const importMatrix = async (file: File) => {
    setImportError(null)
    try {
      const data = await readJSONFile(file)
      const parsed = parseMatrixExport(data)
      if (!parsed) {
        setImportError('That file doesn\u2019t look like a matrix export.')
        return
      }
      const n = parsed.columns.length
      setSize(n)
      setCols(parsed.columns)
      setB(Array.from({ length: n }, (_, i) => parsed.b[i] ?? 0))
    } catch {
      setImportError('Could not read that file as JSON.')
    }
  }

  const Ax = useMemo(() => applyColumns(cols, new Array(size).fill(1)), [cols, size])
  const r = useMemo(() => rank(cols), [cols])
  const det = useMemo(() => determinant(cols), [cols])
  const independent = useMemo(() => isIndependent(cols), [cols])
  const reach = useMemo(() => isReachable(cols, b), [cols, b])

  return (
    <section id="section-8" className="relative min-h-screen px-6 py-28 flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        <SectionHeader index="08" eyebrow="Matrix Playground" title="Build any matrix. See what it tells you.">
          Edit any entry directly. Every statistic below — rank, determinant, independence, reachability —
          recomputes live from the numbers you're looking at.
        </SectionHeader>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono text-white/40">SIZE</span>
          <div className="flex gap-1">
            {[2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                onClick={() => resize(n)}
                className={`w-8 h-8 rounded-lg text-xs font-mono border transition-colors ${
                  size === n ? 'bg-white/15 border-white/30 text-white' : 'bg-white/[0.02] border-white/10 text-white/40 hover:text-white/70'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8">
          <GlassCard className="p-6 overflow-x-auto">
            <p className="text-xs font-mono text-white/40 mb-3">MATRIX A · {size}×{size} (columns c1…c{size})</p>
            <div className="inline-flex items-start gap-3 font-mono">
              <span className="text-2xl text-white/20 leading-none self-stretch flex items-center">[</span>
              <div className="grid gap-x-4 gap-y-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(0,1fr))` }}>
                {Array.from({ length: size }, (_, i) =>
                  Array.from({ length: size }, (_, j) => (
                    <DragNumber
                      key={`${i}-${j}`}
                      value={cols[j]?.[i] ?? 0}
                      onChange={(v) => setEntry(j, i, v)}
                      color={j % 2 === 0 ? 'blue' : 'cyan'}
                      step={0.1}
                      className="text-sm"
                    />
                  )),
                )}
              </div>
              <span className="text-2xl text-white/20 leading-none self-stretch flex items-center">]</span>
            </div>

            <p className="text-xs font-mono text-white/40 mt-6 mb-3">TARGET b</p>
            <div className="inline-flex items-start gap-3 font-mono">
              <span className="text-2xl text-white/20 leading-none self-stretch flex items-center">[</span>
              <div className="flex flex-col gap-1">
                {b.map((v, i) => (
                  <DragNumber key={i} value={v} onChange={(nv) => setB((prev) => prev.map((x, idx) => (idx === i ? nv : x)))} color="ghost" step={0.1} className="text-sm" />
                ))}
              </div>
              <span className="text-2xl text-white/20 leading-none self-stretch flex items-center">]</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              <button onClick={randomize} className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Shuffle className="w-3.5 h-3.5" /> Random matrix
              </button>
              <button onClick={reset} className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button onClick={exportMatrix} className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Download className="w-3.5 h-3.5" /> Export JSON
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> Import JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) importMatrix(file)
                  e.target.value = ''
                }}
              />
            </div>
            {importError && <p className="mt-2 text-xs font-mono text-rose-300">{importError}</p>}
          </GlassCard>

          <div className="grid grid-cols-2 gap-3 content-start">
            <Stat label="Rank" value={`${r} / ${size}`} accent={r === size ? 'mint' : 'rose'} />
            <Stat label="Independent columns" value={independent ? 'Yes' : 'No'} accent={independent ? 'mint' : 'rose'} />
            <Stat label="Determinant" value={det === null ? '—' : round(det, 3).toString()} accent="blue" />
            <Stat label="Ax (all ones)" value={`[${Ax.map((v) => round(v, 2)).join(', ')}]`} accent="cyan" mono small />
            <Stat
              label="Solution exists for b?"
              value={reach.reachable ? 'Yes' : 'No'}
              accent={reach.reachable ? 'mint' : 'rose'}
              className="col-span-2"
            />
            <Stat
              label="Span"
              value={
                r === size ? 'All of the space' : r === 0 ? 'Just the origin' : `A ${r}-dimensional subspace`
              }
              accent="violet"
              className="col-span-2"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
  accent,
  className = '',
  mono = false,
  small = false,
}: {
  label: string
  value: string
  accent: 'blue' | 'cyan' | 'violet' | 'mint' | 'rose'
  className?: string
  mono?: boolean
  small?: boolean
}) {
  const colorMap: Record<string, string> = {
    blue: 'text-[#7fa8ff]',
    cyan: 'text-[#22d3ee]',
    violet: 'text-[#c081ff]',
    mint: 'text-[#34d399]',
    rose: 'text-[#fb6b6b]',
  }
  return (
    <motion.div layout className={`glass rounded-xl p-4 ${className}`}>
      <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1">{label}</p>
      <p className={`${mono ? 'font-mono' : 'font-[var(--font-display)]'} ${small ? 'text-sm' : 'text-lg'} font-semibold ${colorMap[accent]} break-all`}>
        {value}
      </p>
    </motion.div>
  )
}
