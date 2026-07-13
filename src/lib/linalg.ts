// General n-dimensional linear algebra helpers, kept explicit and dependency
// free. Columns are stored as `number[][]`, where `columns[j]` is the j-th
// column vector (this mirrors how we think about A = [c1 c2 ... cn]).

export type Cols = number[][]

export function numRows(cols: Cols): number {
  return cols[0]?.length ?? 0
}
export function numCols(cols: Cols): number {
  return cols.length
}

export function zeros(n: number): number[] {
  return new Array(n).fill(0)
}

// Ax = sum_j x_j * column_j
export function applyColumns(cols: Cols, x: number[]): number[] {
  const rows = numRows(cols)
  const out = zeros(rows)
  for (let j = 0; j < cols.length; j++) {
    const c = cols[j]
    const xj = x[j] ?? 0
    for (let i = 0; i < rows; i++) out[i] += c[i] * xj
  }
  return out
}

export function vecLength(v: number[]): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0))
}

export function vecSub(a: number[], b: number[]): number[] {
  return a.map((v, i) => v - (b[i] ?? 0))
}

export function vecDist(a: number[], b: number[]): number {
  return vecLength(vecSub(a, b))
}

// Deep clone a matrix given as an array of rows.
function cloneRows(rows: number[][]): number[][] {
  return rows.map((r) => [...r])
}

// Convert column-major storage to row-major, optionally augmented with b.
export function toRows(cols: Cols, b?: number[]): number[][] {
  const rows = numRows(cols)
  const out: number[][] = []
  for (let i = 0; i < rows; i++) {
    const row = cols.map((c) => c[i])
    if (b) row.push(b[i])
    out.push(row)
  }
  return out
}

// Gaussian elimination with partial pivoting -> row echelon form.
// Returns { rref, rank, pivotCols }
export function rowEchelon(inputRows: number[][]): { rref: number[][]; rank: number; pivotCols: number[] } {
  const rows = cloneRows(inputRows)
  const m = rows.length
  const n = m > 0 ? rows[0].length : 0
  let lead = 0
  let rank = 0
  const pivotCols: number[] = []
  const EPS = 1e-9

  for (let r = 0; r < m; r++) {
    if (lead >= n) break
    let i = r
    while (i < m && Math.abs(rows[i][lead]) < EPS) i++
    if (i === m) {
      lead++
      r--
      continue
    }
    ;[rows[i], rows[r]] = [rows[r], rows[i]]
    const lv = rows[r][lead]
    rows[r] = rows[r].map((v) => v / lv)
    for (let k = 0; k < m; k++) {
      if (k === r) continue
      const factor = rows[k][lead]
      rows[k] = rows[k].map((v, idx) => v - factor * rows[r][idx])
    }
    pivotCols.push(lead)
    rank++
    lead++
  }
  return { rref: rows, rank, pivotCols }
}

// Rank of the column space (i.e. rank of the matrix formed by these columns).
export function rank(cols: Cols): number {
  if (cols.length === 0) return 0
  const rows = toRows(cols)
  return rowEchelon(rows).rank
}

// Determinant, square matrices only, via LU-style elimination.
export function determinant(cols: Cols): number | null {
  const n = cols.length
  if (numRows(cols) !== n) return null
  const rows = toRows(cols)
  const m = cloneRows(rows)
  let det = 1
  const EPS = 1e-10
  for (let col = 0; col < n; col++) {
    let pivotRow = col
    for (let r = col; r < n; r++) {
      if (Math.abs(m[r][col]) > Math.abs(m[pivotRow][col])) pivotRow = r
    }
    if (Math.abs(m[pivotRow][col]) < EPS) return 0
    if (pivotRow !== col) {
      ;[m[pivotRow], m[col]] = [m[col], m[pivotRow]]
      det *= -1
    }
    det *= m[col][col]
    for (let r = col + 1; r < n; r++) {
      const factor = m[r][col] / m[col][col]
      for (let c = col; c < n; c++) m[r][c] -= factor * m[col][c]
    }
  }
  return det
}

// Does b lie in the span of columns? i.e. does Ax = b have a solution.
// Compares rank(A) to rank([A | b]).
export function isReachable(cols: Cols, b: number[]): { reachable: boolean; rankA: number; rankAb: number } {
  const rankA = rank(cols)
  const rankAb = rank([...cols, b])
  return { reachable: rankA === rankAb, rankA, rankAb }
}

// Least-squares-ish approximate solve via normal equations (works for
// square/consistent systems well; used to animate a "best effort" solution
// when an exact one may not exist). Falls back gracefully on singular data.
export function solveLeastSquares(cols: Cols, b: number[]): number[] | null {
  const n = cols.length
  const rows = numRows(cols)
  // Build AtA (n x n) and Atb (n)
  const AtA: number[][] = Array.from({ length: n }, () => zeros(n))
  const Atb: number[] = zeros(n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let s = 0
      for (let k = 0; k < rows; k++) s += cols[i][k] * cols[j][k]
      AtA[i][j] = s
    }
    let s = 0
    for (let k = 0; k < rows; k++) s += cols[i][k] * b[k]
    Atb[i] = s
  }
  const augmented = AtA.map((row, i) => [...row, Atb[i]])
  const { rref, rank: r } = rowEchelon(augmented)
  if (r < n) {
    // Underdetermined / singular: return best-effort from rref diagonal read-off
    const x = zeros(n)
    for (let i = 0; i < rref.length; i++) {
      const pivotIdx = rref[i].findIndex((v, idx) => idx < n && Math.abs(v - 1) < 1e-6)
      if (pivotIdx >= 0) x[pivotIdx] = rref[i][n]
    }
    return x
  }
  const x = zeros(n)
  for (let i = 0; i < n; i++) x[i] = rref[i][n]
  return x
}

export function isIndependent(cols: Cols): boolean {
  return rank(cols) === cols.length
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function round(n: number, dp = 2): number {
  const f = 10 ** dp
  return Math.round(n * f) / f
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

// Generate a random column matrix of given dims x count, values in [-range, range]
export function randomColumns(dims: number, count: number, range = 4): Cols {
  return Array.from({ length: count }, () => Array.from({ length: dims }, () => round((Math.random() * 2 - 1) * range, 1)))
}

export function identityColumns(n: number): Cols {
  return Array.from({ length: n }, (_, j) => Array.from({ length: n }, (_, i) => (i === j ? 1 : 0)))
}
