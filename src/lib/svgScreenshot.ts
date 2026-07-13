// Rasterizes one of our SVG visualizations to a downloadable PNG. Kept scoped
// to a single <svg> element (rather than the whole page) so it works with no
// extra dependency: serialize -> draw into a canvas -> export.
export function downloadSvgAsPng(svg: SVGSVGElement, filename: string, background = '#090909', scale = 2) {
  const clone = svg.cloneNode(true) as SVGSVGElement
  const viewBox = svg.viewBox.baseVal
  const width = viewBox && viewBox.width ? viewBox.width : svg.clientWidth || 400
  const height = viewBox && viewBox.height ? viewBox.height : svg.clientHeight || 400

  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))

  const xml = new XMLSerializer().serializeToString(clone)
  const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      URL.revokeObjectURL(url)
      return
    }
    ctx.fillStyle = background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(url)

    canvas.toBlob((blob) => {
      if (!blob) return
      const pngUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = pngUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(pngUrl)
    }, 'image/png')
  }
  img.src = url
}
