import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function VibeLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="vibe"
      className="relative mx-auto min-h-screen max-w-md bg-background text-foreground"
      style={{ fontFamily: 'var(--font-inter, Inter, sans-serif)' }}
    >
      <div className="absolute top-2 right-2 z-50">
        <ThemeToggle />
      </div>
      {children}
    </div>
  )
}
