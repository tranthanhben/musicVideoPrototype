import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function DirectorLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="director"
      className="relative min-h-screen bg-background text-foreground"
      style={{
        fontFamily: 'var(--font-source-sans-3, "Source Sans 3", sans-serif)',
      }}
    >
      <div className="absolute top-2 right-2 z-50">
        <ThemeToggle />
      </div>
      {children}
    </div>
  )
}
