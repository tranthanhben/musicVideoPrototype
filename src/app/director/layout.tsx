import type { ReactNode } from 'react'

export default function DirectorLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="director"
      className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)]"
      style={{
        fontFamily: 'var(--font-source-sans-3, "Source Sans 3", sans-serif)',
      }}
    >
      {children}
    </div>
  )
}
