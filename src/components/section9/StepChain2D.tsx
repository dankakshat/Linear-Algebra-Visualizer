import { motion } from 'framer-motion'
import type { Vec2 } from '../../lib/math'
import type React from 'react'

const VIEW = 400
const RANGE = 6
const COLORS = ['#4c7dff', '#22d3ee', '#a855f7', '#34d399', '#f0b429']

function toPx(v: Vec2): Vec2 {
  return { x: VIEW / 2 + (v.x / RANGE) * (VIEW / 2), y: VIEW / 2 - (v.y / RANGE) * (VIEW / 2) }
}

function ArrowSeg({ from, to, color }: { from: Vec2; to: Vec2; color: string }) {
  const p1 = toPx(from)
  const p2 = toPx(to)
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x)
  const headLen = 9
  const h1 = { x: p2.x - headLen * Math.cos(angle - Math.PI / 6), y: p2.y - headLen * Math.sin(angle - Math.PI / 6) }
  const h2 = { x: p2.x - headLen * Math.cos(angle + Math.PI / 6), y: p2.y - headLen * Math.sin(angle + Math.PI / 6) }
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ filter: `drop-shadow(0 0 5px ${color})` }}
    >
      <motion.line
        x1={p1.x} y1={p1.y}
        animate={{ x2: p2.x, y2: p2.y }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        stroke={color} strokeWidth={2.5} strokeLinecap="round"
      />
      <motion.polygon
        animate={{ points: `${p2.x},${p2.y} ${h1.x},${h1.y} ${h2.x},${h2.y}` }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        fill={color}
      />
    </motion.g>
  )
}

export function StepChain2D({
  steps,
  b,
  svgRef,
}: {
  steps: { vec: Vec2; colorIdx: number }[]
  b: Vec2
  svgRef?: React.Ref<SVGSVGElement>
}) {
  const ticks = []
  for (let i = -RANGE; i <= RANGE; i++) if (i !== 0) ticks.push(i)

  let cursor: Vec2 = { x: 0, y: 0 }
  const segments = steps.map((s) => {
    const from = cursor
    const to = { x: cursor.x + s.vec.x, y: cursor.y + s.vec.y }
    cursor = to
    return { from, to, color: COLORS[s.colorIdx % COLORS.length] }
  })
  const result = cursor
  const distance = Math.hypot(result.x - b.x, result.y - b.y)
  const isMatch = distance < 0.15

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className="w-full h-full max-w-[520px] max-h-[520px] mx-auto touch-none select-none"
    >
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
      <line x1={0} y1={VIEW / 2} x2={VIEW} y2={VIEW / 2} stroke="rgba(255,255,255,0.18)" strokeWidth={1.2} />
      <line x1={VIEW / 2} y1={0} x2={VIEW / 2} y2={VIEW} stroke="rgba(255,255,255,0.18)" strokeWidth={1.2} />

      <line x1={toPx({ x: 0, y: 0 }).x} y1={toPx({ x: 0, y: 0 }).y} x2={toPx(b).x} y2={toPx(b).y} stroke="#ffffff" strokeWidth={1.5} strokeDasharray="5 5" />
      <circle {...toPx(b)} r={5} fill="none" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={1.5} />

      {segments.map((s, i) => (
        <ArrowSeg key={i} from={s.from} to={s.to} color={s.color} />
      ))}

      {segments.length > 0 && (
        <circle {...toPx(result)} r={7} fill={isMatch ? '#34d399' : '#fb6b6b'} style={{ filter: `drop-shadow(0 0 8px ${isMatch ? '#34d399' : '#fb6b6b'})` }} />
      )}
    </svg>
  )
}
