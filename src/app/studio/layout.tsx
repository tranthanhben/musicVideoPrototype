import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="studio"
      className="relative min-h-screen bg-background text-foreground overflow-hidden"
      style={{ fontFamily: 'var(--font-jetbrains-mono, "JetBrains Mono", monospace)' }}
    >
      <div className="absolute top-2 right-2 z-50">
        <ThemeToggle />
      </div>
      {children}
    </div>
  )
}
