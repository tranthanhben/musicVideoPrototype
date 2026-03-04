import type { ReactNode } from 'react'

export default function VibeLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="vibe"
      className="relative mx-auto min-h-screen max-w-md bg-[var(--background)] text-[var(--foreground)]"
      style={{ fontFamily: 'var(--font-inter, Inter, sans-serif)' }}
    >
      {children}
    </div>
  )
}
