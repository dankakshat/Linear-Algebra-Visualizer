import { useEffect, useRef } from 'react'

type Arrow = {
  x: number
  y: number
  angle: number
  len: number
  speed: number
  hue: number
  drift: number
  opacity: number
}

const HUES = [220, 190, 270] // blue, cyan, violet

export function FloatingVectors() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const count = 22
    const arrows: Arrow[] = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      angle: Math.random() * Math.PI * 2,
      len: 40 + Math.random() * 70,
      speed: 0.15 + Math.random() * 0.35,
      hue: HUES[Math.floor(Math.random() * HUES.length)],
      drift: (Math.random() - 0.5) * 0.004,
      opacity: 0.12 + Math.random() * 0.22,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const a of arrows) {
        a.angle += a.drift
        a.x += Math.cos(a.angle) * a.speed
        a.y += Math.sin(a.angle) * a.speed

        if (a.x < -100) a.x = w + 100
        if (a.x > w + 100) a.x = -100
        if (a.y < -100) a.y = h + 100
        if (a.y > h + 100) a.y = -100

        const ex = a.x + Math.cos(a.angle) * a.len
        const ey = a.y + Math.sin(a.angle) * a.len

        ctx.save()
        ctx.strokeStyle = `hsla(${a.hue}, 90%, 65%, ${a.opacity})`
        ctx.lineWidth = 1.5
        ctx.shadowColor = `hsla(${a.hue}, 90%, 60%, 0.9)`
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(ex, ey)
        ctx.stroke()

        // arrowhead
        const headLen = 8
        const backAngle1 = a.angle + Math.PI - 0.4
        const backAngle2 = a.angle + Math.PI + 0.4
        ctx.beginPath()
        ctx.moveTo(ex, ey)
        ctx.lineTo(ex + Math.cos(backAngle1) * headLen, ey + Math.sin(backAngle1) * headLen)
        ctx.moveTo(ex, ey)
        ctx.lineTo(ex + Math.cos(backAngle2) * headLen, ey + Math.sin(backAngle2) * headLen)
        ctx.stroke()
        ctx.restore()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    />
  )
}
