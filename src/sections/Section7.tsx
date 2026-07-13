import { useCallback, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../components/shared/GlassCard'
import { SectionHeader } from '../components/shared/SectionHeader'
import { ReachabilityScene3D } from '../components/section7/ReachabilityScene3D'
import { round } from '../lib/linalg'
import { Dices, Check, X as XIcon } from 'lucide-react'

type V3 = [number, number, number]

function randVec(scale = 2): V3 {
  return [round((Math.random() * 2 - 1) * scale, 1), round((Math.random() * 2 - 1) * scale, 1), round((Math.random() * 2 - 1) * scale, 1)]
}

function projectOntoSpan(c1: V3, c2: V3, target: V3): V3 {
  // Gram-Schmidt projection of target onto span{c1, c2}
  const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
  const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s]
  const len = (a: V3) => Math.sqrt(dot(a, a))

  const e1 = scale(c1, 1 / (len(c1) || 1))
  let u2 = sub(c2, scale(e1, dot(c2, e1)))
  const u2len = len(u2) || 1
  const e2 = scale(u2, 1 / u2len)

  const p1 = dot(target, e1)
  const p2 = dot(target, e2)
  return [e1[0] * p1 + e2[0] * p2, e1[1] * p1 + e2[1] * p2, e1[2] * p1 + e2[2] * p2]
}

function dist3(a: V3, b: V3) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

function generateRound() {
  const c1 = randVec(2)
  const c2 = randVec(2)
  const wantsReachable = Math.random() > 0.5
  let b: V3
  if (wantsReachable) {
    const x = round((Math.random() * 2 - 1) * 1.5, 1)
    const y = round((Math.random() * 2 - 1) * 1.5, 1)
    b = [c1[0] * x + c2[0] * y, c1[1] * x + c2[1] * y, c1[2] * x + c2[2] * y]
  } else {
    b = randVec(2.4)
  }
  const closest = projectOntoSpan(c1, c2, b)
  const reachable = dist3(closest, b) < 0.2
  return { c1, c2, b, closest, reachable }
}

export function Section7() {
  const [round1, setRound1] = useState(generateRound)
  const [guess, setGuess] = useState<'yes' | 'no' | null>(null)
  const [revealed, setRevealed] = useState(false)

  const correct = guess !== null && ((guess === 'yes') === round1.reachable)

  const newRound = useCallback(() => {
    setRound1(generateRound())
    setGuess(null)
    setRevealed(false)
  }, [])

  return (
    <section id="section-7" className="relative min-h-screen px-6 py-28 flex items-center">
      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
        <div>
          <SectionHeader index="07" eyebrow="Reachability" title="Can these columns reach b?">
            Two random directions in 3D space span, at best, a flat plane. Look at the vectors below and
            guess whether the white target sits on that plane before you reveal the answer.
          </SectionHeader>

          <GlassCard className="p-6">
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setGuess('yes')}
                disabled={revealed}
                className={`flex-1 py-3 rounded-xl font-mono text-sm border transition-colors disabled:opacity-50 ${
                  guess === 'yes' ? 'bg-cyan-400/15 border-cyan-400/40 text-cyan-300' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                Yes, reachable
              </button>
              <button
                onClick={() => setGuess('no')}
                disabled={revealed}
                className={`flex-1 py-3 rounded-xl font-mono text-sm border transition-colors disabled:opacity-50 ${
                  guess === 'no' ? 'bg-rose-400/15 border-rose-400/40 text-rose-300' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                No, out of span
              </button>
            </div>

            <button
              onClick={() => setRevealed(true)}
              disabled={guess === null || revealed}
              className="w-full py-3 rounded-xl font-mono text-sm bg-gradient-to-r from-[#7fa8ff] to-[#c081ff] text-black font-semibold disabled:opacity-30 disabled:grayscale mb-4"
            >
              Reveal
            </button>

            <AnimatePresence mode="wait">
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl px-4 py-3 border font-mono text-sm flex items-start gap-2 mb-4 ${
                    correct ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300' : 'bg-rose-400/10 border-rose-400/30 text-rose-300'
                  }`}
                >
                  {correct ? <Check className="w-4 h-4 mt-0.5 shrink-0" /> : <XIcon className="w-4 h-4 mt-0.5 shrink-0" />}
                  <span>
                    {round1.reachable
                      ? 'Reachable — b lies exactly on the plane spanned by c1 and c2.'
                      : `Not reachable — the closest point on the span is still ${dist3(round1.closest, round1.b).toFixed(2)} units away. b has a component pointing off the plane that no combination of c1 and c2 can produce.`}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={newRound}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Dices className="w-3.5 h-3.5" /> New round
            </button>
          </GlassCard>
        </div>

        <GlassCard className="p-4 aspect-square">
          <ReachabilityScene3D c1={round1.c1} c2={round1.c2} b={round1.b} closest={round1.closest} revealed={revealed} reachable={round1.reachable} />
        </GlassCard>
      </div>
    </section>
  )
}
