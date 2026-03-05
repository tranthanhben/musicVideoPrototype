import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function ZenLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="zen"
      className="relative bg-background text-foreground min-h-screen"
      style={{ fontFamily: 'var(--font-inter, Inter, sans-serif)' }}
    >
      <div className="absolute top-2 right-2 z-50">
        <ThemeToggle />
      </div>
      {children}
    </div>
  )
}
