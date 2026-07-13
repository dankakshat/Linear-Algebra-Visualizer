import { useMemo } from 'react'
import type { Vec2 } from '../../lib/math'
import { det2 } from '../../lib/math'

const VIEW = 400
const RANGE = 6

function toPx(v: Vec2): Vec2 {
  return { x: VIEW / 2 + (v.x / RANGE) * (VIEW / 2), y: VIEW / 2 - (v.y / RANGE) * (VIEW / 2) }
}

export function SpanVisualizer2D({ c1, c2 }: { c1: Vec2; c2: Vec2 }) {
  const det = det2(c1, c2)
  const isFull = Math.abs(det) > 0.15
  const isZero = Math.hypot(c1.x, c1.y) < 0.05 && Math.hypot(c2.x, c2.y) < 0.05

  // Dense grid of combinations to paint the reachable region, or, when
  // degenerate, the line the columns collapse onto.
  const dots = useMemo(() => {
    if (!isFull) return []
    const pts: Vec2[] = []
    for (let i = -3; i <= 3; i += 0.4) {
      for (let j = -3; j <= 3; j += 0.4) {
        pts.push({ x: c1.x * i + c2.x * j, y: c1.y * i + c2.y * j })
      }
    }
    return pts
  }, [c1, c2, isFull])

  const lineDir = isFull || isZero ? null : Math.hypot(c1.x, c1.y) > 0.02 ? c1 : c2

  const ticks = useMemo(() => {
    const arr: number[] = []
    for (let i = -RANGE; i <= RANGE; i++) if (i !== 0) arr.push(i)
    return arr
  }, [])

  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="w-full h-full max-w-[520px] max-h-[520px] mx-auto touch-none select-none">
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

      {isFull &&
        dots.map((p, i) => {
          const px = toPx(p)
          return <circle key={i} cx={px.x} cy={px.y} r={1.6} fill="#22d3ee" fillOpacity={0.35} />
        })}

      {lineDir && (
        <line
          x1={toPx({ x: -lineDir.x * 3, y: -lineDir.y * 3 }).x}
          y1={toPx({ x: -lineDir.x * 3, y: -lineDir.y * 3 }).y}
          x2={toPx({ x: lineDir.x * 3, y: lineDir.y * 3 }).x}
          y2={toPx({ x: lineDir.x * 3, y: lineDir.y * 3 }).y}
          stroke="#a855f7" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 8px #a855f7)' }}
        />
      )}

      {isZero && <circle {...toPx({ x: 0, y: 0 })} r={5} fill="#fb6b6b" style={{ filter: 'drop-shadow(0 0 8px #fb6b6b)' }} />}

      <line x1={toPx({ x: 0, y: 0 }).x} y1={toPx({ x: 0, y: 0 }).y} x2={toPx(c1).x} y2={toPx(c1).y} stroke="#4c7dff" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 6px #4c7dff)' }} />
      <line x1={toPx({ x: 0, y: 0 }).x} y1={toPx({ x: 0, y: 0 }).y} x2={toPx(c2).x} y2={toPx(c2).y} stroke="#22d3ee" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 6px #22d3ee)' }} />
    </svg>
  )
}
