import type { ReactNode } from 'react'
import { RetroGrid } from '@/components/neon/retro-grid'

export default function NeonLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="neon"
      className="min-h-screen bg-[#0A0A0F] text-[#EEEEF0] relative overflow-hidden"
      style={{ fontFamily: 'var(--font-space-grotesk, "Space Grotesk", sans-serif)' }}
    >
      <RetroGrid />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
