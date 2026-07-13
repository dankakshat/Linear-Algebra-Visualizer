import { useRef, useState, useCallback } from 'react'
import { clamp, round } from '../../lib/math'

type Props = {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  color?: 'blue' | 'cyan' | 'violet' | 'mint' | 'rose' | 'ghost'
  className?: string
  sensitivity?: number // px per unit
}

const colorMap: Record<string, string> = {
  blue: 'text-[#7fa8ff]',
  cyan: 'text-[#22d3ee]',
  violet: 'text-[#c081ff]',
  mint: 'text-[#34d399]',
  rose: 'text-[#fb6b6b]',
  ghost: 'text-white/85',
}

// A value that IS its own slider: drag left/right to change it, click to type
// an exact number. This is the interaction signature used everywhere a matrix
// entry, coordinate, or scalar appears in this project.
export function DragNumber({
  value,
  onChange,
  min = -9,
  max = 9,
  step = 0.1,
  color = 'ghost',
  className = '',
  sensitivity = 12,
}: Props) {
  const [dragging, setDragging] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const startX = useRef(0)
  const startVal = useRef(0)
  const moved = useRef(false)

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      ;(e.target as Element).setPointerCapture(e.pointerId)
      startX.current = e.clientX
      startVal.current = value
      moved.current = false
      setDragging(true)
    },
    [value],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - startX.current
      if (Math.abs(dx) > 2) moved.current = true
      const raw = startVal.current + (dx / sensitivity) * step
      const snapped = Math.round(raw / step) * step
      onChange(clamp(round(snapped, 3), min, max))
    },
    [dragging, sensitivity, step, min, max, onChange],
  )

  const onPointerUp = useCallback(() => {
    setDragging(false)
    if (!moved.current) {
      setDraft(String(round(value, 2)))
      setEditing(true)
    }
  }, [value])

  const commitEdit = () => {
    const n = parseFloat(draft)
    if (!Number.isNaN(n)) onChange(clamp(round(n, 3), min, max))
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitEdit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commitEdit()
          if (e.key === 'Escape') setEditing(false)
        }}
        className={`w-12 bg-white/10 rounded px-1 text-center outline-none font-mono ${colorMap[color]} ${className}`}
      />
    )
  }

  return (
    <span
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={`num-drag select-none inline-block px-1 rounded transition-colors hover:bg-white/10 ${
        dragging ? 'bg-white/15' : ''
      } ${colorMap[color]} ${className}`}
      title="Drag to change, click to type"
    >
      {value >= 0 ? '\u00A0' : ''}
      {round(value, 2)}
    </span>
  )
}
