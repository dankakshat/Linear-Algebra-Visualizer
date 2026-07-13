export type Vec = number[]
export type Matrix = number[][] // matrix.columns[col][row] convention used across the app -> we store as array of column vectors

export type ProgressState = {
  visitedSections: string[]
  quizScore: number
  quizAttempts: number
  learningModeStep: number
  learningModeComplete: boolean
}

export const PROGRESS_KEY = 'column-picture:progress:v1'

export function loadProgress(): ProgressState {
  if (typeof window === 'undefined') {
    return { visitedSections: [], quizScore: 0, quizAttempts: 0, learningModeStep: 0, learningModeComplete: false }
  }
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY)
    if (!raw) throw new Error('none')
    return JSON.parse(raw) as ProgressState
  } catch {
    return { visitedSections: [], quizScore: 0, quizAttempts: 0, learningModeStep: 0, learningModeComplete: false }
  }
}

export function saveProgress(p: ProgressState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p))
}
