// Minimal linear-algebra helpers. Kept dependency-free and explicit so the
// mathematical logic driving each visualization is easy to audit.

export type Vec2 = { x: number; y: number }

export function scale2(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s }
}

export function add2(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function sub2(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y }
}

export function length2(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

export function dist2(a: Vec2, b: Vec2): number {
  return length2(sub2(a, b))
}

// Ax = x*c1 + y*c2, where c1, c2 are the columns of A
export function applyColumns2(c1: Vec2, c2: Vec2, x: number, y: number): Vec2 {
  return add2(scale2(c1, x), scale2(c2, y))
}

// Solve [c1 c2][x y]^T = b exactly via Cramer's rule (2x2 only).
// Returns null when the columns are (near) dependent, i.e. det ~ 0.
export function solve2x2(c1: Vec2, c2: Vec2, b: Vec2): Vec2 | null {
  const det = c1.x * c2.y - c2.x * c1.y
  if (Math.abs(det) < 1e-9) return null
  const x = (b.x * c2.y - c2.x * b.y) / det
  const y = (c1.x * b.y - b.x * c1.y) / det
  return { x, y }
}

export function det2(c1: Vec2, c2: Vec2): number {
  return c1.x * c2.y - c2.x * c1.y
}

export function round(n: number, dp = 2): number {
  const f = 10 ** dp
  return Math.round(n * f) / f
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
