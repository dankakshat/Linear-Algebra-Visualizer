import { useMemo } from 'react'
import type { Vec2 } from '../../lib/math'

const VIEW = 400
const RANGE = 6

function toPx(v: Vec2): Vec2 {
  return { x: VIEW / 2 + (v.x / RANGE) * (VIEW / 2), y: VIEW / 2 - (v.y / RANGE) * (VIEW / 2) }
}

// A line a*x + b*y = c, clipped to the view box.
function lineSegment(a: number, b: number, c: number): [Vec2, Vec2] | null {
  const pts: Vec2[] = []
  // Intersect with x = -RANGE and x = RANGE
  if (Math.abs(b) > 1e-9) {
    pts.push({ x: -RANGE, y: (c - a * -RANGE) / b })
    pts.push({ x: RANGE, y: (c - a * RANGE) / b })
  }
  if (Math.abs(a) > 1e-9) {
    pts.push({ x: (c - b * -RANGE) / a, y: -RANGE })
    pts.push({ x: (c - b * RANGE) / a, y: RANGE })
  }
  const inRange = pts.filter((p) => Math.abs(p.x) <= RANGE + 0.01 && Math.abs(p.y) <= RANGE + 0.01)
  if (inRange.length < 2) return null
  return [inRange[0], inRange[1]]
}

function intersection(a1: number, b1: number, c1: number, a2: number, b2: number, c2: number): Vec2 | null {
  const det = a1 * b2 - a2 * b1
  if (Math.abs(det) < 1e-9) return null
  return { x: (c1 * b2 - c2 * b1) / det, y: (a1 * c2 - a2 * c1) / det }
}

export function LinePicture2D({
  row1,
  row2,
  b1,
  b2,
  point,
  isMatch,
}: {
  row1: Vec2
  row2: Vec2
  b1: number
  b2: number
  point: Vec2
  isMatch: boolean
}) {
  const seg1 = useMemo(() => lineSegment(row1.x, row1.y, b1), [row1, b1])
  const seg2 = useMemo(() => lineSegment(row2.x, row2.y, b2), [row2, b2])
  const ix = useMemo(() => intersection(row1.x, row1.y, b1, row2.x, row2.y, b2), [row1, row2, b1, b2])

  const ticks = useMemo(() => {
    const arr: number[] = []
    for (let i = -RANGE; i <= RANGE; i++) if (i !== 0) arr.push(i)
    return arr
  }, [])

  const ptPx = toPx(point)

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

      {seg1 && (
        <line
          x1={toPx(seg1[0]).x} y1={toPx(seg1[0]).y} x2={toPx(seg1[1]).x} y2={toPx(seg1[1]).y}
          stroke="#4c7dff" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 6px #4c7dff)' }}
        />
      )}
      {seg2 && (
        <line
          x1={toPx(seg2[0]).x} y1={toPx(seg2[0]).y} x2={toPx(seg2[1]).x} y2={toPx(seg2[1]).y}
          stroke="#22d3ee" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 6px #22d3ee)' }}
        />
      )}

      {ix && (
        <circle
          {...toPx(ix)} r={6} fill={isMatch ? '#34d399' : '#a855f7'}
          style={{ filter: `drop-shadow(0 0 8px ${isMatch ? '#34d399' : '#a855f7'})` }}
        />
      )}

      <circle {...ptPx} r={5} fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={1.5} />
    </svg>
  )
}
