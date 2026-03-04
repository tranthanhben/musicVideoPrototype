import type { ReactNode } from 'react'

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="studio"
      className="min-h-screen bg-[#0D0D0D] text-[#E5E7EB] overflow-hidden"
      style={{ fontFamily: 'var(--font-jetbrains-mono, "JetBrains Mono", monospace)' }}
    >
      {children}
    </div>
  )
}
