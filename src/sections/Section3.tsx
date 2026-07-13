import { useMemo, useState } from 'react'
import { GlassCard } from '../components/shared/GlassCard'
import { SectionHeader } from '../components/shared/SectionHeader'
import { DragNumber } from '../components/shared/DragNumber'
import { Scene3D } from '../components/section3/Scene3D'
import { Check } from 'lucide-react'

const C1: [number, number, number] = [1.5, 0.3, -0.6]
const C2: [number, number, number] = [-0.4, 1.6, 0.5]
const C3: [number, number, number] = [0.6, -0.5, 1.4]
const B: [number, number, number] = [1.2, 1.0, 0.9]

function dist3(a: [number, number, number], b: [number, number, number]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

export function Section3() {
  const [x, setX] = useState(0.8)
  const [y, setY] = useState(0.6)
  const [z, setZ] = useState(0.4)

  const result: [number, number, number] = useMemo(
    () => [C1[0] * x + C2[0] * y + C3[0] * z, C1[1] * x + C2[1] * y + C3[1] * z, C1[2] * x + C2[2] * y + C3[2] * z],
    [x, y, z],
  )
  const distance = dist3(result, B)
  const isMatch = distance < 0.15

  const sliders: Array<{ label: string; value: number; setter: (v: number) => void; color: 'blue' | 'cyan' | 'violet' }> = [
    { label: 'x', value: x, setter: setX, color: 'blue' },
    { label: 'y', value: y, setter: setY, color: 'cyan' },
    { label: 'z', value: z, setter: setZ, color: 'violet' },
  ]

  return (
    <section id="section-3" className="relative min-h-screen px-6 py-28 flex items-center">
      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-[1fr_1.3fr] gap-10 items-center">
        <div>
          <SectionHeader index="03" eyebrow="One Dimension Up" title="The same idea, in 3D.">
            Nothing about the logic changes — only the picture gets an extra axis. Three columns, three
            scalars, one chained sum. Drag to orbit, scroll to zoom.
          </SectionHeader>

          <GlassCard className="p-6 space-y-4">
            {sliders.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className={s.color === 'blue' ? 'text-[#7fa8ff]' : s.color === 'cyan' ? 'text-[#22d3ee]' : 'text-[#c081ff]'}>{s.label}</span>
                  <DragNumber value={s.value} onChange={s.setter} min={-2} max={2} color={s.color} step={0.05} />
                </div>
                <input
                  type="range" min={-2} max={2} step={0.02} value={s.value}
                  onChange={(e) => s.setter(parseFloat(e.target.value))}
                  className={`w-full ${s.color === 'blue' ? 'accent-[#4c7dff]' : s.color === 'cyan' ? 'accent-[#22d3ee]' : 'accent-[#a855f7]'}`}
                />
              </div>
            ))}

            <div
              className={`flex items-center gap-3 rounded-xl px-4 py-3 border font-mono text-sm mt-2 ${
                isMatch ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300' : 'bg-white/5 border-white/10 text-white/50'
              }`}
            >
              {isMatch ? <Check className="w-4 h-4" /> : null}
              {isMatch ? 'Reached b — everything glows.' : `distance from b: ${distance.toFixed(2)}`}
            </div>
          </GlassCard>
        </div>

        <GlassCard className="p-3 aspect-square">
          <Scene3D c1={C1} c2={C2} c3={C3} x={x} y={y} z={z} b={B} isMatch={isMatch} />
        </GlassCard>
      </div>
    </section>
  )
}
