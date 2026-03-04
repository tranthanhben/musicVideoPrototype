import type { ReactNode } from 'react'

export default function ZenLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="zen"
      className="bg-[var(--background)] text-[var(--foreground)] min-h-screen"
      style={{ fontFamily: 'var(--font-inter, Inter, sans-serif)' }}
    >
      {children}
    </div>
  )
}
