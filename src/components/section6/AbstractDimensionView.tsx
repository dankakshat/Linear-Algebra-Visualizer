import { motion } from 'framer-motion'
import { useMemo } from 'react'

const HUES = ['#4c7dff', '#22d3ee', '#a855f7', '#34d399', '#fb6b6b', '#f0b429', '#ec4899', '#818cf8', '#2dd4bf']

// Represents each axis as a glowing radial spoke, each column as a colored
// beam whose length along every spoke encodes that column's component in
// that dimension. b is drawn as a dashed white beam set. This can't show
// "true" 7D geometry -- nothing can -- but it keeps the same visual grammar
// (axes + beams + combination) that the 2D/3D views use, so the underlying
// idea (a beam per column, scaled and summed) stays recognizable.
export function AbstractDimensionView({
  dims,
  columns,
  b,
  weights,
}: {
  dims: number
  columns: number[][] // columns[j][i]
  b: number[]
  weights: number[] // scalar for each column
}) {
  const size = 420
  const cx = size / 2
  const cy = size / 2
  const R = size / 2 - 46

  const axisPoints = useMemo(() => {
    return Array.from({ length: dims }, (_, i) => {
      const angle = (i / dims) * Math.PI * 2 - Math.PI / 2
      return { x: cx + Math.cos(angle) * R, y: cy + Math.sin(angle) * R, angle }
    })
  }, [dims, cx, cy, R])

  // A "component profile" polygon for a given vector: for each axis i, plot
  // a point at radius proportional to |value on that axis|, scaled 0..R.
  const maxAbs = useMemo(() => {
    let m = 1
    for (const c of columns) for (const v of c) m = Math.max(m, Math.abs(v))
    for (const v of b) m = Math.max(m, Math.abs(v))
    return m
  }, [columns, b])

  const polygonPoints = (vec: number[]) =>
    axisPoints
      .map((p, i) => {
        const v = vec[i] ?? 0
        const r = (Math.abs(v) / maxAbs) * R * 0.92
        const sign = v < 0 ? -1 : 1
        const x = cx + Math.cos(p.angle) * r * sign
        const y = cy + Math.sin(p.angle) * r * sign
        return `${x},${y}`
      })
      .join(' ')

  const combined = useMemo(() => {
    const out = new Array(dims).fill(0)
    columns.forEach((c, j) => {
      const w = weights[j] ?? 0
      c.forEach((v, i) => (out[i] += v * w))
    })
    return out
  }, [columns, weights, dims])

  const combinedDist = useMemo(() => {
    let s = 0
    for (let i = 0; i < dims; i++) s += (combined[i] - (b[i] ?? 0)) ** 2
    return Math.sqrt(s)
  }, [combined, b, dims])
  const isMatch = combinedDist < 0.25

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full max-w-[520px] max-h-[520px]">
        <defs>
          <radialGradient id="dim-bg" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(76,125,255,0.07)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={size} height={size} fill="url(#dim-bg)" />

        {/* spokes */}
        {axisPoints.map((p, i) => (
          <g key={i}>
            <line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
            <circle cx={p.x} cy={p.y} r={3} fill="rgba(255,255,255,0.35)" />
            <text x={p.x + (p.x - cx) * 0.14} y={p.y + (p.y - cy) * 0.14} fontSize="10" fill="rgba(255,255,255,0.4)" fontFamily="var(--font-mono)" textAnchor="middle">
              {i + 1}
            </text>
          </g>
        ))}

        {/* target b profile */}
        <motion.polygon
          animate={{ points: polygonPoints(b) }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />

        {/* column beams from center, one color per column */}
        {columns.map((c, j) => {
          const scaled = c.map((v) => v * (weights[j] ?? 0))
          return (
            <motion.polygon
              key={j}
              animate={{ points: polygonPoints(scaled) }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              fill={HUES[j % HUES.length]}
              fillOpacity={0.08}
              stroke={HUES[j % HUES.length]}
              strokeWidth={1.5}
              style={{ filter: `drop-shadow(0 0 4px ${HUES[j % HUES.length]})` }}
            />
          )
        })}

        {/* combined result profile */}
        <motion.polygon
          animate={{ points: polygonPoints(combined) }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          fill={isMatch ? 'rgba(52,211,153,0.15)' : 'rgba(251,107,107,0.1)'}
          stroke={isMatch ? '#34d399' : '#fb6b6b'}
          strokeWidth={2.5}
          style={{ filter: `drop-shadow(0 0 8px ${isMatch ? '#34d399' : '#fb6b6b'})` }}
        />

        <circle cx={cx} cy={cy} r={3} fill="white" />
      </svg>
    </div>
  )
}
