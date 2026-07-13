import type { ReactNode } from 'react'

export function GlassCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`glass rounded-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] ${className}`}>
      {children}
    </div>
  )
}
