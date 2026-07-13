import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../components/shared/GlassCard'
import { SectionHeader } from '../components/shared/SectionHeader'
import { DragNumber } from '../components/shared/DragNumber'
import { VectorField2D } from '../components/section1/VectorField2D'
import { applyColumns2, dist2, round, type Vec2 } from '../lib/math'
import { loadProgress, saveProgress } from '../lib/types'
import { Check, X as XIcon, ChevronRight, ChevronLeft, RotateCcw, GraduationCap, Brain, Swords } from 'lucide-react'

type Tab = 'learn' | 'quiz' | 'challenge'

const C1: Vec2 = { x: 2, y: -1 }
const C2: Vec2 = { x: -1, y: 2 }
const B: Vec2 = { x: 0, y: 3 }
// x=1, y=2 solves x*C1 + y*C2 = B exactly.
const SOLUTION = { x: 1, y: 2 }

const LEARN_STEPS: { title: string; body: string; x: number; y: number }[] = [
  { title: 'This is Column 1.', body: 'c₁ = (2, −1). Every column of a matrix is just a direction and a distance — a place you can walk to from the origin.', x: 0, y: 0 },
  { title: 'This is Column 2.', body: 'c₂ = (−1, 2). A second direction. On their own, c₁ and c₂ are just two arrows sitting in the plane.', x: 0, y: 0 },
  { title: 'We scale Column 1.', body: 'Multiplying c₁ by x stretches or shrinks it along its own line. Here x = 1, so c₁ is unchanged.', x: 1, y: 0 },
  { title: 'We scale Column 2.', body: 'Multiplying c₂ by y = 2 doubles its length. It still points the same direction — scaling never changes direction, only how far you go.', x: 1, y: 2 },
  { title: 'We add them.', body: 'Vector addition is head-to-tail: slide y·c₂ so it starts where x·c₁ ends. The arrow from the origin to that final point is the sum.', x: 1, y: 2 },
  { title: 'We reached b.', body: 'x·c₁ + y·c₂ lands exactly on b = (0, 3). That combination — x = 1, y = 2 — is the solution to Ax = b.', x: 1, y: 2 },
]

type Question = { q: string; options: string[]; correct: number; explanation: string }

const QUESTIONS: Question[] = [
  {
    q: 'In the Column Picture, what does Ax actually compute?',
    options: [
      'A linear combination of the columns of A',
      'The determinant of A',
      'The inverse of A',
      'A row-by-row comparison of A and x',
    ],
    correct: 0,
    explanation: 'Ax = x₁c₁ + x₂c₂ + ... — a sum of scaled columns, not a row operation.',
  },
  {
    q: 'If column 2 equals 2× column 1, what happens to the columns geometrically?',
    options: ['They become perpendicular', 'They collapse onto the same line', 'They span all of space', 'Nothing changes'],
    correct: 1,
    explanation: 'Any scalar multiple of a vector points along the same line, so the two columns collapse onto one direction.',
  },
  {
    q: 'Two independent columns in 3D space can reach:',
    options: ['Every point in 3D space', 'Only the origin', 'Every point on a 2D plane through the origin', 'Only points on a single line'],
    correct: 2,
    explanation: 'Two independent directions span a flat plane through the origin — a full 2D subspace of the 3D space they live in.',
  },
  {
    q: 'What does it mean for Ax = b to have no solution?',
    options: [
      'b is not in the span of the columns of A',
      'A has too many columns',
      'x must be negative',
      'The matrix A is too large to compute',
    ],
    correct: 0,
    explanation: 'No combination of the columns can reach b — b points at least partly outside everything the columns can build.',
  },
  {
    q: 'A square matrix has independent columns. What does that guarantee?',
    options: [
      'Its determinant is zero',
      'Ax = b has exactly one solution for every b',
      'All of its entries are positive',
      'Its columns are all the same length',
    ],
    correct: 1,
    explanation: 'Independent columns in a square matrix span the whole space and never overlap in what they can reach, so every b has exactly one solution.',
  },
  {
    q: 'Why can\'t humans directly visualize a 7-dimensional vector?',
    options: [
      'Because 7D vectors don\'t really exist mathematically',
      'Because our visual intuition is built for 2D and 3D space, though the algebra works identically in any dimension',
      'Because computers cannot store 7 numbers',
      'Because 7 is a prime number',
    ],
    correct: 1,
    explanation: 'A 7D vector is just a list of 7 numbers — the addition and scaling rules are identical to 2D, only the mental picture runs out.',
  },
]

function makeChallenge() {
  const rx = () => Math.round((Math.random() * 6 - 3))
  let c1: Vec2, c2: Vec2, det: number
  do {
    c1 = { x: rx(), y: rx() }
    c2 = { x: rx(), y: rx() }
    det = c1.x * c2.y - c2.x * c1.y
  } while (Math.abs(det) < 1) // ensure a unique solution exists
  const sx = Math.round(Math.random() * 4 - 2)
  const sy = Math.round(Math.random() * 4 - 2)
  const b = applyColumns2(c1, c2, sx, sy)
  return { c1, c2, b, sx, sy }
}

export function Section10() {
  const [tab, setTab] = useState<Tab>('learn')

  return (
    <section id="section-10" className="relative min-h-screen px-6 py-28">
      <div className="max-w-6xl mx-auto w-full">
        <SectionHeader index="10" eyebrow="Learning Mode" title="Learn it, test it, prove it.">
          A guided walkthrough of the exact example from Section 1, a conceptual quiz, and a computational
          challenge — three ways to check the Column Picture has actually clicked.
        </SectionHeader>

        <div className="flex gap-2 mb-8">
          <TabButton active={tab === 'learn'} onClick={() => setTab('learn')} icon={<GraduationCap className="w-3.5 h-3.5" />}>
            Learn
          </TabButton>
          <TabButton active={tab === 'quiz'} onClick={() => setTab('quiz')} icon={<Brain className="w-3.5 h-3.5" />}>
            Quiz
          </TabButton>
          <TabButton active={tab === 'challenge'} onClick={() => setTab('challenge')} icon={<Swords className="w-3.5 h-3.5" />}>
            Challenge
          </TabButton>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'learn' && (
            <motion.div key="learn" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <LearnPanel />
            </motion.div>
          )}
          {tab === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <QuizPanel />
            </motion.div>
          )}
          {tab === 'challenge' && (
            <motion.div key="challenge" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <ChallengePanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: ReactNode; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono border transition-colors ${
        active ? 'bg-white/15 border-white/30 text-white' : 'bg-white/[0.02] border-white/10 text-white/40 hover:text-white/70'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

function LearnPanel() {
  const [step, setStep] = useState(() => Math.min(loadProgress().learningModeStep, LEARN_STEPS.length - 1))
  const current = LEARN_STEPS[step]

  useEffect(() => {
    const p = loadProgress()
    saveProgress({ ...p, learningModeStep: step, learningModeComplete: step === LEARN_STEPS.length - 1 })
  }, [step])

  const result = applyColumns2(C1, C2, current.x, current.y)
  const distance = dist2(result, B)
  const isMatch = distance < 0.12

  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
      <GlassCard className="p-6">
        <p className="text-xs font-mono text-white/40 mb-3">
          STEP {step + 1} / {LEARN_STEPS.length}
        </p>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
            <h3 className="font-[var(--font-display)] text-2xl font-semibold mb-3">{current.title}</h3>
            <p className="text-white/65 text-sm leading-relaxed mb-6">{current.body}</p>
          </motion.div>
        </AnimatePresence>

        {step === LEARN_STEPS.length - 1 && (
          <div className={`rounded-xl px-4 py-3 border font-mono text-xs mb-6 ${isMatch ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300' : 'bg-white/5 border-white/10 text-white/50'}`}>
            {isMatch ? '✓ Correct Solution — x = 1, y = 2' : `distance from b: ${distance.toFixed(2)}`}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-1 text-xs font-mono px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>
          <button
            onClick={() => setStep((s) => Math.min(LEARN_STEPS.length - 1, s + 1))}
            disabled={step === LEARN_STEPS.length - 1}
            className="flex-1 flex items-center justify-center gap-1 text-xs font-mono px-3 py-2 rounded-lg bg-gradient-to-r from-[#7fa8ff] to-[#c081ff] text-black font-semibold disabled:opacity-30 disabled:grayscale"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setStep(0)}
            className="flex items-center gap-1 text-xs font-mono px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restart
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-4 aspect-square">
        <VectorField2D c1={C1} c2={C2} x={current.x} y={current.y} b={B} isMatch={isMatch} onDragResult={() => {}} />
      </GlassCard>
    </div>
  )
}

function QuizPanel() {
  const [order] = useState(() => [...QUESTIONS].sort(() => Math.random() - 0.5))
  const [i, setI] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [sessionScore, setSessionScore] = useState(0)
  const [progress, setProgress] = useState(loadProgress)

  const question = order[i]
  const answered = selected !== null

  const choose = (idx: number) => {
    if (answered) return
    setSelected(idx)
    const next = {
      ...progress,
      quizAttempts: progress.quizAttempts + 1,
      quizScore: progress.quizScore + (idx === question.correct ? 1 : 0),
    }
    setProgress(next)
    saveProgress(next)
    if (idx === question.correct) setSessionScore((s) => s + 1)
  }

  const next = () => {
    setSelected(null)
    setI((v) => (v + 1) % order.length)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4 text-xs font-mono text-white/40">
        <span>
          Question {i + 1} / {order.length}
        </span>
        <span>
          Session: {sessionScore} correct · All-time: {progress.quizScore}/{progress.quizAttempts}
        </span>
      </div>
      <GlassCard className="p-6">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <h3 className="font-[var(--font-display)] text-lg font-semibold mb-5">{question.q}</h3>
            <div className="space-y-2 mb-5">
              {question.options.map((opt, idx) => {
                const isCorrect = answered && idx === question.correct
                const isWrongPick = answered && idx === selected && idx !== question.correct
                return (
                  <button
                    key={idx}
                    onClick={() => choose(idx)}
                    disabled={answered}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-mono border transition-colors flex items-center justify-between ${
                      isCorrect
                        ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300'
                        : isWrongPick
                          ? 'bg-rose-400/10 border-rose-400/30 text-rose-300'
                          : 'bg-white/[0.02] border-white/10 hover:bg-white/10 disabled:hover:bg-white/[0.02]'
                    }`}
                  >
                    {opt}
                    {isCorrect && <Check className="w-4 h-4 shrink-0" />}
                    {isWrongPick && <XIcon className="w-4 h-4 shrink-0" />}
                  </button>
                )
              })}
            </div>
            {answered && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/60 text-sm leading-relaxed mb-5">
                {question.explanation}
              </motion.p>
            )}
            <button
              onClick={next}
              disabled={!answered}
              className="flex items-center gap-1.5 text-xs font-mono px-4 py-2 rounded-lg bg-gradient-to-r from-[#7fa8ff] to-[#c081ff] text-black font-semibold disabled:opacity-30 disabled:grayscale"
            >
              Next question <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </AnimatePresence>
      </GlassCard>
    </div>
  )
}

function ChallengePanel() {
  const [challenge, setChallenge] = useState(makeChallenge)
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [checked, setChecked] = useState(false)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)

  const result = useMemo(() => applyColumns2(challenge.c1, challenge.c2, x, y), [challenge, x, y])
  const distance = dist2(result, challenge.b)
  const isCorrect = distance < 0.1

  const check = () => {
    setChecked(true)
    if (isCorrect) {
      setStreak((s) => {
        const next = s + 1
        setBest((b) => Math.max(b, next))
        return next
      })
    } else {
      setStreak(0)
    }
  }

  const nextChallenge = () => {
    setChallenge(makeChallenge())
    setX(0)
    setY(0)
    setChecked(false)
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
      <GlassCard className="p-6">
        <p className="text-xs font-mono text-white/40 mb-3">FIND x AND y SUCH THAT Ax = b</p>

        <div className="flex items-center gap-6 font-mono mb-6">
          <div className="flex items-start gap-2">
            <span className="text-2xl text-white/20">[</span>
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-[#7fa8ff]">
                {round(challenge.c1.x, 1)} {round(challenge.c2.x, 1)}
              </span>
              <span className="text-[#22d3ee]">
                {round(challenge.c1.y, 1)} {round(challenge.c2.y, 1)}
              </span>
            </div>
            <span className="text-2xl text-white/20">]</span>
          </div>
          <span className="text-white/30">·x =</span>
          <div className="flex items-start gap-2">
            <span className="text-2xl text-white/20">[</span>
            <div className="flex flex-col gap-1 text-sm text-white/80">
              <span>{round(challenge.b.x, 1)}</span>
              <span>{round(challenge.b.y, 1)}</span>
            </div>
            <span className="text-2xl text-white/20">]</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-[#7fa8ff]">x</span>
              <span className="text-white/50">{x}</span>
            </div>
            <input type="range" min={-6} max={6} step={1} value={x} onChange={(e) => setX(parseInt(e.target.value))} className="w-full accent-[#4c7dff]" />
          </div>
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-[#22d3ee]">y</span>
              <span className="text-white/50">{y}</span>
            </div>
            <input type="range" min={-6} max={6} step={1} value={y} onChange={(e) => setY(parseInt(e.target.value))} className="w-full accent-[#22d3ee]" />
          </div>
        </div>

        {checked && (
          <div className={`rounded-xl px-4 py-3 border font-mono text-xs mb-4 ${isCorrect ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300' : 'bg-rose-400/10 border-rose-400/30 text-rose-300'}`}>
            {isCorrect ? '✓ Correct — nicely solved.' : `Not quite — off by ${distance.toFixed(2)}. Try again or reveal a new challenge.`}
          </div>
        )}

        <div className="flex items-center justify-between text-xs font-mono text-white/40 mb-4">
          <span>Streak: {streak}</span>
          <span>Best: {best}</span>
        </div>

        <div className="flex gap-2">
          <button onClick={check} className="flex-1 py-2.5 rounded-xl font-mono text-sm bg-gradient-to-r from-[#7fa8ff] to-[#c081ff] text-black font-semibold">
            Check
          </button>
          <button onClick={nextChallenge} className="flex-1 py-2.5 rounded-xl font-mono text-sm bg-white/5 hover:bg-white/10 transition-colors">
            New challenge
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-4 aspect-square">
        <VectorField2D c1={challenge.c1} c2={challenge.c2} x={x} y={y} b={challenge.b} isMatch={isCorrect} onDragResult={() => {}} />
      </GlassCard>
    </div>
  )
}
