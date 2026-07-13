// Small, dependency-free helpers for turning a matrix + target vector into a
// downloadable JSON file, and reading one back. Used by the Matrix Playground
// (export/import) so a session can be saved and restored later.

export type MatrixExport = {
  version: 1
  size: number
  columns: number[][]
  b: number[]
}

export function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function readJSONFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

// Validates the shape of an imported matrix file. Returns null if it doesn't
// look like a matrix export, so the caller can show a friendly error instead
// of crashing on malformed input.
export function parseMatrixExport(data: unknown): MatrixExport | null {
  if (typeof data !== 'object' || data === null) return null
  const d = data as Record<string, unknown>
  if (!Array.isArray(d.columns) || !Array.isArray(d.b)) return null
  const size = typeof d.size === 'number' ? d.size : d.columns.length
  const columns = d.columns as unknown[]
  if (!columns.every((c) => Array.isArray(c) && c.every((v) => typeof v === 'number'))) return null
  if (!(d.b as unknown[]).every((v) => typeof v === 'number')) return null
  return { version: 1, size, columns: columns as number[][], b: d.b as number[] }
}
