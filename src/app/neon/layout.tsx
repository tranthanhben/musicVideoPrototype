import type { ReactNode } from 'react'
import { RetroGrid } from '@/components/neon/retro-grid'
import { ThemeToggle } from '@/components/theme-toggle'

export default function NeonLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="neon"
      className="min-h-screen bg-background text-foreground relative overflow-hidden"
      style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk", sans-serif)' }}
    >
      <div className="absolute top-2 right-2 z-50">
        <ThemeToggle />
      </div>
      <RetroGrid />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
