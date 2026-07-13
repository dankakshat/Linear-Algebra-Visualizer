type Section = { id: string; label: string }

export function SectionDots({
  sections,
  active,
}: {
  sections: Section[]
  active: string
}) {
  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-4">
      {sections.map((s, i) => {
        const isActive = s.id === active
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="group relative flex items-center justify-end"
          >
            <span
              className={`mr-3 whitespace-nowrap text-xs font-mono transition-all duration-300 ${
                isActive
                  ? 'opacity-100 translate-x-0 text-white'
                  : 'opacity-0 translate-x-2 text-white/60 group-hover:opacity-100 group-hover:translate-x-0'
              }`}
            >
              {String(i).padStart(2, '0')} — {s.label}
            </span>
            <span
              className={`block rounded-full transition-all duration-300 ${
                isActive
                  ? 'w-2.5 h-2.5 bg-gradient-to-br from-[#4c7dff] to-[#a855f7] glow-blue'
                  : 'w-1.5 h-1.5 bg-white/25 group-hover:bg-white/50'
              }`}
            />
          </a>
        )
      })}
    </div>
  )
}
