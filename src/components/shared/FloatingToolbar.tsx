import { useEffect, useState } from 'react'
import { Maximize, Minimize } from 'lucide-react'

// A small persistent control, separate from the per-section scroll dots.
// Currently just fullscreen, but this is the natural home for any future
// global (not-tied-to-one-section) controls.
export function FloatingToolbar() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen can be denied by the browser (e.g. iframes without
        // allowfullscreen) — fail silently rather than throwing in the UI.
      })
    }
  }

  return (
    <button
      onClick={toggleFullscreen}
      title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      className="fixed left-5 top-5 z-40 w-10 h-10 rounded-xl glass flex items-center justify-center text-white/50 hover:text-white transition-colors"
    >
      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
    </button>
  )
}
