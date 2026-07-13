import { useMemo, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { Vec2 } from '../../lib/math'

const VIEW = 400 // logical px, square viewBox
const RANGE = 6 // math units shown from center to edge

function toPx(v: Vec2): Vec2 {
  return { x: VIEW / 2 + (v.x / RANGE) * (VIEW / 2), y: VIEW / 2 - (v.y / RANGE) * (VIEW / 2) }
}
function toMath(px: Vec2): Vec2 {
  return { x: ((px.x - VIEW / 2) / (VIEW / 2)) * RANGE, y: -((px.y - VIEW / 2) / (VIEW / 2)) * RANGE }
}

function Arrow({
  from,
  to,
  color,
  width = 2.5,
  dashed = false,
  glow,
  label,
}: {
  from: Vec2
  to: Vec2
  color: string
  width?: number
  dashed?: boolean
  glow?: boolean
  label?: string
}) {
  const p1 = toPx(from)
  const p2 = toPx(to)
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x)
  const headLen = 10
  const h1 = {
    x: p2.x - headLen * Math.cos(angle - Math.PI / 6),
    y: p2.y - headLen * Math.sin(angle - Math.PI / 6),
  }
  const h2 = {
    x: p2.x - headLen * Math.cos(angle + Math.PI / 6),
    y: p2.y - headLen * Math.sin(angle + Math.PI / 6),
  }
  return (
    <g style={glow ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined}>
      <motion.line
        x1={p1.x}
        y1={p1.y}
        animate={{ x2: p2.x, y2: p2.y }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dashed ? '5 5' : undefined}
        strokeLinecap="round"
      />
      <motion.polygon
        animate={{ points: `${p2.x},${p2.y} ${h1.x},${h1.y} ${h2.x},${h2.y}` }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        fill={color}
      />
      {label && (
        <motion.text
          animate={{ x: p2.x + 10, y: p2.y - 6 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          fill={color}
          fontSize="13"
          fontFamily="var(--font-mono)"
          fontWeight={600}
        >
          {label}
        </motion.text>
      )}
    </g>
  )
}

export function VectorField2D({
  c1,
  c2,
  x,
  y,
  b,
  isMatch,
  onDragResult,
}: {
  c1: Vec2
  c2: Vec2
  x: number
  y: number
  b: Vec2
  isMatch: boolean
  onDragResult: (mathPt: Vec2) => void
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState(false)

  const xc1 = { x: c1.x * x, y: c1.y * x }
  const yc2 = { x: c2.x * y, y: c2.y * y }
  const result = { x: xc1.x + yc2.x, y: xc1.y + yc2.y }

  const ticks = useMemo(() => {
    const arr: number[] = []
    for (let i = -RANGE; i <= RANGE; i++) if (i !== 0) arr.push(i)
    return arr
  }, [])

  const pointerToMath = useCallback((e: React.PointerEvent) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * VIEW
    const py = ((e.clientY - rect.top) / rect.height) * VIEW
    return toMath({ x: px, y: py })
  }, [])

  const resultPx = toPx(result)

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className="w-full h-full max-w-[520px] max-h-[520px] mx-auto touch-none select-none"
    >
      <defs>
        <radialGradient id="bg-glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(76,125,255,0.06)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={VIEW} height={VIEW} fill="url(#bg-glow)" />

      {/* grid */}
      {ticks.map((t) => {
        const p = toPx({ x: t, y: 0 })
        const q = toPx({ x: 0, y: t })
        return (
          <g key={t}>
            <line x1={p.x} y1={0} x2={p.x} y2={VIEW} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            <line x1={0} y1={q.y} x2={VIEW} y2={q.y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          </g>
        )
      })}
      {/* axes */}
      <line x1={0} y1={VIEW / 2} x2={VIEW} y2={VIEW / 2} stroke="rgba(255,255,255,0.18)" strokeWidth={1.2} />
      <line x1={VIEW / 2} y1={0} x2={VIEW / 2} y2={VIEW} stroke="rgba(255,255,255,0.18)" strokeWidth={1.2} />

      {/* base columns from origin, faint */}
      <Arrow from={{ x: 0, y: 0 }} to={c1} color="#4c7dff" width={1.5} dashed />
      <Arrow from={{ x: 0, y: 0 }} to={c2} color="#22d3ee" width={1.5} dashed />

      {/* scaled columns */}
      <Arrow from={{ x: 0, y: 0 }} to={xc1} color="#4c7dff" glow label={`x·c\u2081`} />
      <Arrow from={xc1} to={result} color="#22d3ee" glow label={`y·c\u2082`} />

      {/* target b */}
      <Arrow from={{ x: 0, y: 0 }} to={b} color="#ffffff" width={1.5} dashed />
      <circle {...toPx(b)} r={5} fill="none" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={1.5} />

      {/* result Ax, draggable */}
      <motion.g
        animate={{ x: 0, y: 0 }}
        style={isMatch ? { filter: 'drop-shadow(0 0 10px #34d399)' } : { filter: 'drop-shadow(0 0 8px #fb6b6b)' }}
      >
        <Arrow from={{ x: 0, y: 0 }} to={result} color={isMatch ? '#34d399' : '#fb6b6b'} width={3} glow />
      </motion.g>

      <motion.circle
        animate={{ cx: resultPx.x, cy: resultPx.y }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        r={dragging ? 10 : 8}
        fill={isMatch ? '#34d399' : '#fb6b6b'}
        stroke="black"
        strokeWidth={2}
        className="cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          ;(e.target as Element).setPointerCapture(e.pointerId)
          setDragging(true)
        }}
        onPointerMove={(e) => {
          if (!dragging) return
          onDragResult(pointerToMath(e))
        }}
        onPointerUp={() => setDragging(false)}
      />
    </svg>
  )
}
